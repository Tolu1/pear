import { Controller, Post, Body } from '@nestjs/common';
import { BamlService } from './baml.service';
import { DetectionRequestDto } from './dto/detection-request.dto';
import { StartAutomationDto } from './dto/start-automation.dto';
import { ContinueAutomationDto } from './dto/continue-automation.dto';

@Controller()
export class BamlController {
  constructor(private readonly bamlService: BamlService) {}

  @Post('detection')
  async detect(@Body() request: DetectionRequestDto) {
    return this.bamlService.detect(request.url, request.screenshot);
  }

  @Post('automation/start')
  async startAutomation(@Body() request: StartAutomationDto) {
    return this.bamlService.startAutomation(
      request.goal,
      request.url,
      request.screenshot,
    );
  }

  @Post('automation/continue')
  async continueAutomation(@Body() request: ContinueAutomationDto) {
    return this.bamlService.continueAutomation(
      request.sessionId,
      request.previousAction,
      request.actionResult,
      request.currentUrl,
      request.currentScreenshot,
    );
  }
}
