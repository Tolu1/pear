export class StartAutomationDto {
  goal: string;
  url: string;
  screenshot: string;
  viewport: {
    width: number;
    height: number;
    devicePixelRatio: number;
  };
  domContent: string;
}
