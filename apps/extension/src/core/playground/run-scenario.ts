import { createAgent } from "@/lib/agent/create-agent";
import { renderAction } from "@/lib/agent/render-action";
import { getActiveTab } from "@/lib/browser/get-active-tab";
import { navigateTab } from "@/lib/browser/navigate-tab";
import { usePlaygroundStore } from "@/stores/playground.store";
import { useBetaAccessStore } from "@/stores/beta-access.store";
import { queryClient } from "@/lib/query-client";
import { betaAccessKeys } from "@/lib/query-keys";
import type { BetaAccess } from "@/interfaces/beta-access";

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

  queryClient.setQueriesData<BetaAccess>(
    { queryKey: betaAccessKeys.all },
    (prev) =>
      prev ? { ...prev, remaining: Math.max(0, prev.remaining - 1) } : prev,
  );

  try {
    if (url) {
      appendFeed("action", `⛓︎ open ${url}`);
      await navigateTab(tab.id, url);
    }

    const agent = createAgent(tab.id, useBetaAccessStore.getState().code);
    agent.on("thought", (thought, usage) => {
      appendFeed("thought", thought);
      if (usage) {
        const tokens = usage.inputTokens + usage.outputTokens;
        const hasCost =
          usage.inputCost !== undefined || usage.outputCost !== undefined;
        const cost = hasCost
          ? `$${((usage.inputCost ?? 0) + (usage.outputCost ?? 0)).toFixed(4)}`
          : "N/A";
        // Cost is computed but kept internal, the public feed shows only tokens.
        void cost;
        appendFeed("usage", `${tokens.toLocaleString()} tokens`);
      }
    });
    agent.on("actionStarted", (action) =>
      appendFeed("action", renderAction(action)),
    );

    let sessionId: string;
    try {
      sessionId = await agent.start({
        goal: trimmedGoal,
        targetUrl: url ?? tab.url,
      });
    } catch (error) {
      console.warn("[run] the run couldn't start:", error);
      setStatus("unavailable");
      return;
    }

    const outcome = await agent.run(sessionId);

    if (outcome.status === "done") {
      appendFeed("outcome", `✓ ${outcome.evidence || "done"}`);
      setStatus("done");
    } else {
      appendFeed("outcome", `✕ ${outcome.reason || "failed"}`);
      setStatus("failed");
    }
  } finally {
    queryClient.invalidateQueries({ queryKey: betaAccessKeys.all });
  }
}
