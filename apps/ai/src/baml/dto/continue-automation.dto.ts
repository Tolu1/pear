export class ContinueAutomationDto {
  sessionId: string;
  previousAction: string;
  actionResult: string;
  currentUrl: string;
  currentScreenshot: string;
  viewport: {
    width: number;
    height: number;
    devicePixelRatio: number;
  };
  domContent: string;
}
