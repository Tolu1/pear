export class ContinueAutomationDto {
  sessionId: string;
  previousAction: string;
  actionResult: string;
  currentUrl: string;
  currentScreenshot: string;
}
