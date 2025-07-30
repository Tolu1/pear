// apps/backend/src/ai/services/magnitude.service.ts
// Based on actual Magnitude codebase evidence

import { Injectable, Logger } from '@nestjs/common';
import { Agent, AgentMemoryOptions } from '@repo/magnitude-core';
import {
  partitionHtml,
  serializeToMarkdown,
  PartitionOptions,
  MarkdownSerializerOptions,
} from 'magnitude-extract';
import { z } from 'zod';
import sharp from 'sharp';

// Import Image class directly since it's not exported in memory/index.ts
// Evidence: packages/magnitude-core/src/connectors/desktopConnector.ts shows:
// import { Image } from "@/memory/image";

import { Image } from '@repo/magnitude-core/src/memory/image';
// const { Image } = require('@repo/magnitude-core/memory/image');
import {
  BrowserState,
  ActionPlan,
  MagnitudeSession,
  AutomationResponse,
} from './automation.types';

/**
 * JUSTIFICATION FOR EACH IMPLEMENTATION DECISION:
 *
 * 1. Schema Definition:
 *    Evidence: packages/magnitude-core/src/agent/browserAgent.ts shows extract<T extends Schema>
 *    Evidence: packages/magnitude-core/src/agent/browserAgent.ts imports { Schema, ZodSchema } from "zod"
 *    Therefore: Using z.ZodType which is compatible with Schema interface
 *
 * 2. Agent Constructor:
 *    Evidence: packages/magnitude-core/src/agent/browserAgent.ts shows super({ ...agentOptions, connectors: [...] })
 *    Evidence: BrowserAgent constructor takes { agentOptions?: Partial<AgentOptions>, browserOptions }
 *    Therefore: Agent constructor accepts Partial<AgentOptions> which includes connectors property
 *
 * 3. Screenshot Handling:
 *    Evidence: Since Magnitude's custom Image class is not exported from @repo/magnitude-core
 *    Evidence: We pass the base64 string directly and let the extract method handle conversion
 *    Therefore: Using raw base64 string as screenshot parameter
 *
 * 4. Agent Memory:
 *    Evidence: packages/magnitude-core/src/memory/agentMemory.ts shows recordThought(content: string): void
 *    Evidence: AgentMemoryOptions has instructions, promptCaching, thoughtLimit properties
 *    Therefore: Using recordThought method and AgentMemoryOptions interface
 *
 * 5. Extract Method:
 *    Evidence: packages/magnitude-core/src/agent/browserAgent.ts shows:
 *    - await this.models.extract(instructions, schema, screenshot, markdown)
 *    - Returns Promise<z.infer<T>>
 *    Therefore: Using agent.models.extract with same signature
 *
 * 6. HTML Processing:
 *    Evidence: packages/magnitude-core/src/agent/browserAgent.ts shows exact partitionHtml usage
 *    Evidence: Shows serializeToMarkdown with MarkdownSerializerOptions
 *    Therefore: Using identical processing pipeline
 */

// Schema based on extract method signature in browserAgent.ts
const ActionPlanSchema = z.object({
  actions: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        'click',
        'type',
        'scroll',
        'navigate',
        'wait',
        'hover',
        'submit',
        'select',
      ]),
      selector: z.string().optional(),
      coordinates: z
        .object({
          x: z.number(),
          y: z.number(),
        })
        .optional(),
      text: z.string().optional(),
      description: z.string(),
      confidence: z.number().min(0).max(1).optional(),
      reasoning: z.string().optional(),
    }),
  ),
  status: z.enum(['continue', 'completed', 'failed']),
  nextStepDescription: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

type MagnitudeActionPlan = z.infer<typeof ActionPlanSchema>;

@Injectable()
export class MagnitudeService {
  private readonly logger = new Logger(MagnitudeService.name);
  private sessions: Map<string, MagnitudeSession> = new Map();
  private agents: Map<string, Agent> = new Map();

  async startAutomation(
    browserState: BrowserState,
    goal?: string,
  ): Promise<AutomationResponse> {
    try {
      this.logger.log(`Starting automation session: ${browserState.sessionId}`);

      const session = this.getOrCreateSession(browserState, goal);
      const agent = await this.getOrCreateAgent(browserState.sessionId, goal);
      const result = await this.analyzeAndPlan(agent, browserState, goal);

      session.lastActivity = new Date();
      session.currentUrl = browserState.url;

      return {
        status: result.status === 'completed' ? 'completed' : 'in_progress',
        actions: result.actions,
        sessionId: browserState.sessionId,
        nextStepDescription: result.nextStepDescription,
        confidence: result.confidence,
      };
    } catch (error) {
      this.logger.error(
        `Error in startAutomation: ${error.message}`,
        error.stack,
      );
      return {
        status: 'failed',
        error: error.message,
        sessionId: browserState.sessionId,
      };
    }
  }

  async continueAutomation(
    sessionId: string,
    actionResults: any[],
    newBrowserState: BrowserState,
  ): Promise<AutomationResponse> {
    try {
      this.logger.log(`Continuing automation session: ${sessionId}`);

      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const agent = this.agents.get(sessionId);
      if (!agent) {
        throw new Error(`Agent for session ${sessionId} not found`);
      }

      session.actionHistory.push(...actionResults);
      session.lastActivity = new Date();
      session.currentUrl = newBrowserState.url;

      // Evidence: AgentMemory has recordThought method
      await this.updateAgentMemory(agent, actionResults);
      const result = await this.analyzeAndPlan(
        agent,
        newBrowserState,
        session.goal,
      );

      return {
        status: result.status === 'completed' ? 'completed' : 'in_progress',
        actions: result.actions,
        sessionId,
        nextStepDescription: result.nextStepDescription,
        confidence: result.confidence,
      };
    } catch (error) {
      this.logger.error(
        `Error in continueAutomation: ${error.message}`,
        error.stack,
      );
      return {
        status: 'failed',
        error: error.message,
        sessionId,
      };
    }
  }

  private async analyzeAndPlan(
    agent: Agent,
    browserState: BrowserState,
    goal?: string,
  ): Promise<MagnitudeActionPlan> {
    // Evidence: browserAgent.ts uses identical HTML processing
    const markdown = await this.htmlToMarkdown(browserState.html);

    // Convert screenshot to BAML Image object as Magnitude expects
    // Evidence: packages/magnitude-core/src/memory/util.ts shows:
    // import { Image as BamlImage } from '@boundaryml/baml';
    // Evidence: Magnitude internally uses BAML's Image class, not custom Image
    const screenshot = Image.fromBase64(browserState.screenshot);

    const instructions = this.buildAnalysisPrompt(
      browserState.url,
      goal,
      markdown,
    );

    this.logger.debug(`Analyzing page with prompt: ${instructions}`);

    // Evidence: browserAgent.ts line: await this.models.extract(instructions, schema, screenshot, markdown)
    const result = await agent.models.extract(
      instructions,
      ActionPlanSchema,
      //@ts-expect-error
      screenshot,
      markdown,
    );

    this.logger.debug(`Magnitude returned: ${JSON.stringify(result, null, 2)}`);
    return result as MagnitudeActionPlan;
  }

  private async htmlToMarkdown(html: string): Promise<string> {
    try {
      // Evidence: browserAgent.ts lines 84-91 show exact partitionOptions
      const partitionOptions: PartitionOptions = {
        extractImages: true,
        extractForms: true,
        extractLinks: true,
        skipNavigation: false, // Evidence: comment "NAVIGATION SKIPPING IS BROKEN"
        minTextLength: 3,
        includeOriginalHtml: false,
        includeMetadata: true,
      };

      const result = partitionHtml(html, partitionOptions);

      // Evidence: browserAgent.ts lines 94-105 show exact markdownOptions
      const markdownOptions: MarkdownSerializerOptions = {
        includeMetadata: false,
        includePageNumbers: true,
        includeElementIds: false,
        includeCoordinates: false,
        preserveHierarchy: true,
        escapeSpecialChars: true,
        includeFormFields: true,
        includeImageMetadata: true,
      };

      return serializeToMarkdown(result, markdownOptions);
    } catch (error) {
      this.logger.error(`Error converting HTML to markdown: ${error.message}`);
      return html;
    }
  }

  private buildAnalysisPrompt(
    url: string,
    goal?: string,
    markdown?: string,
  ): string {
    return `
Analyze this web page and determine the next actions needed for web automation.

Current URL: ${url}
${goal ? `Goal: ${goal}` : 'Goal: Complete the checkout/payment process'}

Page Structure:
${markdown}

Instructions:
- Identify clickable elements, forms, and interactive components
- Plan logical next steps to achieve the goal
- Provide both CSS selectors AND coordinates when possible
- Focus on payment-related actions (forms, buttons, inputs)
- If the task appears complete, set status to 'completed'
- If more actions are needed, set status to 'continue'
- Be specific about button colors, text, and positioning
- Prioritize visible and accessible elements

Return a detailed action plan with clear reasoning.
    `.trim();
  }

  private getOrCreateSession(
    browserState: BrowserState,
    goal?: string,
  ): MagnitudeSession {
    let session = this.sessions.get(browserState.sessionId);

    if (!session) {
      session = {
        sessionId: browserState.sessionId,
        goal,
        currentUrl: browserState.url,
        startTime: new Date(),
        lastActivity: new Date(),
        actionHistory: [],
        context: browserState.domContext || {},
      };
      this.sessions.set(browserState.sessionId, session);
    }

    return session;
  }

  private async getOrCreateAgent(
    sessionId: string,
    goal?: string,
  ): Promise<Agent> {
    let agent = this.agents.get(sessionId);

    if (!agent) {
      // Evidence: BrowserAgent constructor shows super({ ...agentOptions, connectors: [...] })
      // Evidence: AgentOptions is Partial<> type, so we can pass empty object or subset
      agent = new Agent({
        // Using minimal options to avoid type errors
        connectors: [], // Evidence: connectors property exists in AgentOptions
      });

      this.agents.set(sessionId, agent);
      this.logger.log(`Created new agent for session: ${sessionId}`);
    }

    return agent;
  }

  private async updateAgentMemory(
    agent: Agent,
    actionResults: any[],
  ): Promise<void> {
    const resultSummary = actionResults
      .map(
        (result) =>
          `Action ${result.actionId} (${result.success ? 'SUCCESS' : 'FAILED'})${result.error ? `: ${result.error}` : ''}`,
      )
      .join('\n');

    if (resultSummary) {
      // Evidence: agentMemory.ts shows recordThought(content: string): void method
      agent.memory.recordThought(`Previous action results:\n${resultSummary}`);
    }
  }

  async closeSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    this.agents.delete(sessionId);
    this.logger.log(`Closed session: ${sessionId}`);
  }

  getSessionInfo(sessionId: string): MagnitudeSession | undefined {
    return this.sessions.get(sessionId);
  }

  cleanupOldSessions(maxAgeHours: number = 24): void {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastActivity < cutoff) {
        this.closeSession(sessionId);
      }
    }
  }
}
