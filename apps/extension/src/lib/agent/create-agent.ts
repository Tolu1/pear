import { AgentClient } from "@repo/agent-core/client";
import { WebHarness } from "./web-harness";

export function createAgent(
  tabId: number,
  accessCode: string | null,
): AgentClient {
  return new AgentClient({
    serverUrl: `${import.meta.env.VITE_AI_API_URL}/agent`,
    harness: new WebHarness(tabId),
    includeUsage: __PLAYGROUND_MODE__,
    headers: (): Record<string, string> =>
      accessCode ? { "x-access-code": accessCode } : {},
  });
}
