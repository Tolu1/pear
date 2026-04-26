import { ai } from "@/lib/ai";
import type { AutomationResult } from "@/lib/automation/interfaces/automation-result";

interface ContinueAutomationBody {
  sessionId: string | null;
  previousAction: string;
  actionResult: string;
  currentUrl: string | undefined;
  currentScreenshot: string;
  viewport: { width: number; height: number; devicePixelRatio: number };
  domContent: string;
}

export async function continueAutomation(body: ContinueAutomationBody) {
  return mapper(await fetcher(body));
}

async function fetcher(body: ContinueAutomationBody) {
  return ai.post<AutomationResult>("/automation/continue", body);
}

function mapper(data: Awaited<ReturnType<typeof fetcher>>) {
  return data;
}
