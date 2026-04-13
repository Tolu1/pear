import { Injectable } from '@nestjs/common';
import { b } from './baml_client';
import { Image } from '@boundaryml/baml';
import { AutomationSession } from './interfaces/automation-session.interface';
import { v4 as uuidv4 } from 'uuid';
import { CoordinateService } from '../coordinate/coordinate.service';
import { ViewportInfo } from '../coordinate/coordinate.service';

@Injectable()
export class BamlService {
  private sessions = new Map<string, AutomationSession>();

  constructor(private readonly coordinateService: CoordinateService) {}

  async detect(url: string, screenshot: string) {
    const image = Image.fromBase64('image/jpeg', screenshot);
    const detection = await b.Detect(url, image);
    return detection;
  }

  async startAutomation(
    goal: string,
    url: string,
    screenshot: string,
    viewport: ViewportInfo,
    domContent: string,
  ) {
    try {
      const sessionId = uuidv4();
      const processed = await this.coordinateService.preprocessImage(
        screenshot,
        viewport,
      );

      const image = Image.fromBase64('image/jpeg', processed.base64);
      const plan = await b.PlanAutomation(goal, url, image, domContent, null);

      // Check if any action requires user input
      const hasUserActionRequired = plan.actions.some(
        (action) => action.type === 'user_action_required',
      );

      if (hasUserActionRequired) {
        return {
          success: true,
          sessionId: null,
          plan: plan.actions,
          isComplete: false,
          userMessage: plan.actions.find(
            (a) => a.type === 'user_action_required',
          )?.userMessage,
          debugScreenshot: processed.base64,
        };
      }

      // Transform coordinates in actions back to browser space
      const transformedActions = plan.actions.map((action) => {
        if (action.type === 'user_action_required' || !action.coordinates) {
          return action;
        }

        const browserCoords =
          this.coordinateService.transformCoordinatesToBrowser(
            action.coordinates.x,
            action.coordinates.y,
            processed.transformationData,
          );

        return { ...action, coordinates: browserCoords };
      });

      // Create session
      const session: AutomationSession = {
        id: sessionId,
        goal,
        conversationHistory: [
          `Started automation with goal: ${goal}`,
          `Initial URL: ${url}`,
          `Plan: ${plan.reasoning}`,
        ],
        isComplete: plan.isComplete,
        createdAt: new Date(),
      };

      this.sessions.set(sessionId, session);

      return {
        success: true,
        sessionId,
        plan: transformedActions,
        isComplete: plan.isComplete,
        reasoning: plan.reasoning,
        nextStep: plan.nextStep,
        debugScreenshot: processed.base64,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async continueAutomation(
    sessionId: string,
    previousAction: string,
    actionResult: string,
    currentUrl: string,
    currentScreenshot: string,
    viewport: ViewportInfo,
    domContent: string,
  ) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return { success: false, error: 'Session not found' };
      }

      if (session.isComplete) {
        return {
          success: true,
          message: 'Automation already complete',
          isComplete: true,
        };
      }

      const processed = await this.coordinateService.preprocessImage(
        currentScreenshot,
        viewport,
      );

      const image = Image.fromBase64('image/jpeg', processed.base64);
      const conversationHistory = session.conversationHistory.join('\n');

      const plan = await b.ContinueAutomation(
        session.goal,
        previousAction,
        actionResult,
        currentUrl,
        image,
        domContent,
        conversationHistory,
      );

      // Transform coordinates in actions back to browser space
      const transformedActions = plan.actions.map((action) => {
        if (!action.coordinates) return action;

        const browserCoords =
          this.coordinateService.transformCoordinatesToBrowser(
            action.coordinates.x,
            action.coordinates.y,
            processed.transformationData,
          );

        return { ...action, coordinates: browserCoords };
      });

      // Update session
      session.conversationHistory.push(
        `Action: ${previousAction}`,
        `Result: ${actionResult}`,
        `New plan: ${plan.reasoning}`,
      );
      session.isComplete = plan.isComplete;

      return {
        success: true,
        sessionId,
        plan: transformedActions,
        isComplete: plan.isComplete,
        reasoning: plan.reasoning,
        nextStep: plan.nextStep,
        debugScreenshot: processed.base64,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
