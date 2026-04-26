import { ai } from "@/lib/ai";
import type { AutomationResult } from "@/lib/automation/interfaces/automation-result";

interface StartAutomationBody {
  goal: string;
  url: string | undefined;
  screenshot: string;
  viewport: { width: number; height: number; devicePixelRatio: number };
  domContent: string;
}

export async function startAutomation(body: StartAutomationBody) {
  return mapper(await fetcher(body));
}

async function fetcher(body: StartAutomationBody) {
  return ai.post<AutomationResult>("/automation/start", body);
}

function mapper(data: Awaited<ReturnType<typeof fetcher>>) {
  return data;
}
