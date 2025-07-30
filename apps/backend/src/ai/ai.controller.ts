// apps/backend/src/ai/controllers/automation.controller.ts
import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Get,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { MagnitudeService } from './magnitude.service';
import {
  AutomationStartDto,
  AutomationContinueDto,
} from './dto/automation-request.dto';
import { AutomationResponseDto } from './dto/automation-response.dto';

@Controller('api/automation')
export class AutomationController {
  private readonly logger = new Logger(AutomationController.name);

  constructor(private readonly magnitudeService: MagnitudeService) {}

  /**
   * Start a new automation session
   * POST /api/automation/start
   */
  @Post('start')
  async startAutomation(
    @Body() body: AutomationStartDto,
  ): Promise<AutomationResponseDto> {
    try {
      this.logger.log(`Starting automation for session: ${body.sessionId}`);

      // Validate required fields
      if (!body.sessionId || !body.screenshot || !body.url || !body.html) {
        throw new HttpException(
          'Missing required fields: sessionId, screenshot, url, html',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate screenshot is base64
      if (!this.isValidBase64(body.screenshot)) {
        throw new HttpException(
          'Invalid screenshot format. Expected base64 string.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const browserState = {
        sessionId: body.sessionId,
        screenshot: body.screenshot,
        url: body.url,
        html: body.html,
        domContext: body.domContext,
        userAgent: body.userAgent,
        viewport: body.viewport,
      };

      const result = await this.magnitudeService.startAutomation(
        browserState,
        body.goal,
      );

      this.logger.log(
        `Automation started for session ${body.sessionId}: ${result.status}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error in startAutomation: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Internal server error during automation start',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Continue automation with action results
   * POST /api/automation/continue
   */
  @Post('continue')
  async continueAutomation(
    @Body() body: AutomationContinueDto,
  ): Promise<AutomationResponseDto> {
    try {
      this.logger.log(`Continuing automation for session: ${body.sessionId}`);

      // Validate required fields
      if (
        !body.sessionId ||
        !body.actionResults ||
        !body.newScreenshot ||
        !body.currentUrl ||
        !body.newHtml
      ) {
        throw new HttpException(
          'Missing required fields: sessionId, actionResults, newScreenshot, currentUrl, newHtml',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate screenshot is base64
      if (!this.isValidBase64(body.newScreenshot)) {
        throw new HttpException(
          'Invalid screenshot format. Expected base64 string.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const newBrowserState = {
        sessionId: body.sessionId,
        screenshot: body.newScreenshot,
        url: body.currentUrl,
        html: body.newHtml,
        domContext: body.domContext,
      };

      const result = await this.magnitudeService.continueAutomation(
        body.sessionId,
        body.actionResults,
        newBrowserState,
      );

      this.logger.log(
        `Automation continued for session ${body.sessionId}: ${result.status}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error in continueAutomation: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Internal server error during automation continue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get session information
   * GET /api/automation/session/:sessionId
   */
  @Get('session/:sessionId')
  async getSession(@Param('sessionId') sessionId: string) {
    try {
      const session = this.magnitudeService.getSessionInfo(sessionId);

      if (!session) {
        throw new HttpException(
          `Session ${sessionId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        sessionId: session.sessionId,
        goal: session.goal,
        currentUrl: session.currentUrl,
        startTime: session.startTime,
        lastActivity: session.lastActivity,
        actionCount: session.actionHistory.length,
        status: 'active',
      };
    } catch (error) {
      this.logger.error(`Error getting session ${sessionId}: ${error.message}`);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Internal server error getting session',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Close/delete a session
   * DELETE /api/automation/session/:sessionId
   */
  @Delete('session/:sessionId')
  async closeSession(@Param('sessionId') sessionId: string) {
    try {
      await this.magnitudeService.closeSession(sessionId);

      return {
        success: true,
        message: `Session ${sessionId} closed successfully`,
      };
    } catch (error) {
      this.logger.error(`Error closing session ${sessionId}: ${error.message}`);

      throw new HttpException(
        'Internal server error closing session',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Health check endpoint
   * GET /api/automation/health
   */
  @Get('health')
  async healthCheck() {
    return {
      status: 'ok',
      service: 'automation',
      timestamp: new Date().toISOString(),
      magnitude: 'connected',
    };
  }

  /**
   * Validate base64 string
   */
  private isValidBase64(str: string): boolean {
    try {
      // Remove data URL prefix if present
      const base64String = str.replace(/^data:image\/[a-z]+;base64,/, '');

      // Check if it's valid base64
      const buffer = Buffer.from(base64String, 'base64');
      return buffer.toString('base64') === base64String;
    } catch {
      return false;
    }
  }
}
