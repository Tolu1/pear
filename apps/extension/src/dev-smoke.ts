// TEMPORARY — Phase A end-to-end smoke. From the side panel devtools console:
//   __runAgentSmoke("complete the checkout")
// Verifies the extension drives the full agent loop against live apps/ai.
// Remove once the agent path is confirmed.
import { createAgent } from "@/lib/agent/create-agent";
import { getActiveTab } from "@/lib/browser/get-active-tab";
import type { AgentRunResult } from "@repo/agent-core/client";

async function runAgentSmoke(goal: string): Promise<AgentRunResult> {
  const tab = await getActiveTab();
  if (!tab.id) throw new Error("No active tab");

  const agent = createAgent(tab.id);
  agent.on("thought", (t) => console.log("[agent] thought:", t));
  agent.on("actionStarted", (a) => console.log("[agent] →", a.variant, a));
  agent.on("actionDone", (a) => console.log("[agent] ✓", a.variant));

  console.log("[agent] running:", goal, "on", tab.url);
  const result = await agent.run({ goal, targetUrl: tab.url });
  console.log("[agent] result:", result);
  return result;
}

(window as unknown as { __runAgentSmoke: typeof runAgentSmoke }).__runAgentSmoke =
  runAgentSmoke;
