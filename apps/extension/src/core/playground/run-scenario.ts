import { createAgent } from "@/lib/agent/create-agent";
import { renderAction } from "@/lib/agent/render-action";
import { getActiveTab } from "@/lib/browser/get-active-tab";
import { navigateTab } from "@/lib/browser/navigate-tab";
import { usePlaygroundStore } from "@/stores/playground.store";

export interface RunScenarioInput {
  goal: string;
  targetUrl?: string;
}

export async function runScenario({
  goal,
  targetUrl,
}: RunScenarioInput): Promise<void> {
  const { reset, setStatus, appendFeed } = usePlaygroundStore.getState();

  const trimmedGoal = goal.trim();
  const url = targetUrl?.trim() || undefined;

  reset();
  setStatus("running");
  appendFeed("goal", trimmedGoal);

  const tab = await getActiveTab();
  if (!tab.id) {
    appendFeed("error", "No active browser tab to drive");
    setStatus("failed");
    return;
  }

  if (url) {
    appendFeed("action", `⛓︎ open ${url}`);
    await navigateTab(tab.id, url);
  }

  const agent = createAgent(tab.id);
  agent.on("thought", (thought) => appendFeed("thought", thought));
  agent.on("actionStarted", (action) =>
    appendFeed("action", renderAction(action)),
  );

  const sessionId = await agent.start({
    goal: trimmedGoal,
    targetUrl: url ?? tab.url,
  });
  const outcome = await agent.run(sessionId);

  if (outcome.status === "done") {
    appendFeed("outcome", `✓ ${outcome.evidence || "done"}`);
    setStatus("done");
  } else {
    appendFeed("outcome", `✕ ${outcome.reason || "failed"}`);
    setStatus("failed");
  }
}
