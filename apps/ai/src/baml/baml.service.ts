import { Injectable } from '@nestjs/common';
import { b } from './baml_client';
import { Image } from '@boundaryml/baml';
import { AutomationSession } from './interfaces/automation-session.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BamlService {
  private sessions = new Map<string, AutomationSession>();

  async detect(url: string, screenshot: string) {
    const image = Image.fromBase64('image/jpeg', screenshot);

    const detection = await b.Detect(url, image);
    return detection;
  }

  async startAutomation(goal: string, url: string, screenshot: string) {
    try {
      const sessionId = uuidv4();
      const image = Image.fromBase64('image/jpeg', screenshot);

      // Call PlanAutomation BAML function
      const plan = await b.PlanAutomation(goal, url, image, null);

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
        plan: plan.actions,
        isComplete: plan.isComplete,
        reasoning: plan.reasoning,
        nextStep: plan.nextStep,
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
  ) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return {
          success: false,
          error: 'Session not found',
        };
      }

      if (session.isComplete) {
        return {
          success: true,
          message: 'Automation already complete',
          isComplete: true,
        };
      }

      const image = Image.fromBase64('image/jpeg', currentScreenshot);
      const conversationHistory = session.conversationHistory.join('\n');

      // Call ContinueAutomation BAML function
      const plan = await b.ContinueAutomation(
        session.goal,
        previousAction,
        actionResult,
        currentUrl,
        image,
        conversationHistory,
      );

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
        plan: plan.actions,
        isComplete: plan.isComplete,
        reasoning: plan.reasoning,
        nextStep: plan.nextStep,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
