import { getViewportInfo, getDOMContent } from "@/lib/utils";
import { getActiveTab } from "@/lib/browser/get-active-tab";
import { attachDebugger, detachDebugger, executeAction } from "./runtime";
import type { AutomationAction } from "./interfaces/automation-action";
import type { AutomationResult } from "./interfaces/automation-result";

interface SessionState {
  sessionId: string | null;
  currentPlan: AutomationAction[] | null;
  debuggerTabId: number | null;
}

const state: SessionState = {
  sessionId: null,
  currentPlan: null,
  debuggerTabId: null,
};

export interface SessionCallbacks {
  onWarning: (message: string) => void;
  onError: (message: string) => void;
  onComplete: () => void;
}

async function fetchAI(
  path: string,
  body: Record<string, unknown>,
  timeoutMs = 30000,
): Promise<AutomationResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_AI_API_URL}${path}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 529) {
        throw new Error(
          "Our servers are currently overloaded. Please try again shortly.",
        );
      }
      throw new Error(`Something went wrong (Error ${response.status}).`);
    }

    return await response.json();
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Automation request timed out");
    }
    throw error;
  }
}

async function capturePageState() {
  const tab = await getActiveTab();
  const dataUrl = await chrome.tabs.captureVisibleTab();
  const base64 = dataUrl.split(",")[1];
  const viewport = await getViewportInfo();
  const domContent = await getDOMContent();
  return { tab, base64, viewport, domContent };
}

export async function start(
  goal: string,
  callbacks: SessionCallbacks,
): Promise<void> {
  try {
    const { tab, base64, viewport, domContent } = await capturePageState();

    const result = await fetchAI("/automation/start", {
      goal,
      url: tab.url,
      screenshot: base64,
      viewport,
      domContent,
    });
    console.log("[automation] start result", result);

    if (!result.success) {
      throw new Error(result.error || "Automation failed to start");
    }

    state.sessionId = result.sessionId ?? null;
    state.currentPlan = result.plan ?? null;

    if (!state.currentPlan || state.currentPlan.length === 0) {
      cleanup();
      callbacks.onError("Automation returned an empty plan");
      return;
    }

    const firstAction = state.currentPlan[0];

    if (firstAction.type === "user_action_required") {
      cleanup();
      callbacks.onWarning(
        firstAction.userMessage ||
          "Please complete the required fields before proceeding",
      );
      return;
    }

    if (tab.id) {
      await attachDebugger(tab.id);
      state.debuggerTabId = tab.id;
    }

    await executeLoop(callbacks);
  } catch (error: unknown) {
    cleanup();
    callbacks.onError(
      error instanceof Error ? error.message : "Something went wrong",
    );
  }
}

async function executeLoop(callbacks: SessionCallbacks): Promise<void> {
  while (state.currentPlan && state.currentPlan.length > 0) {
    const nextAction = state.currentPlan[0];

    if (nextAction.type === "user_action_required") {
      cleanup();
      callbacks.onError(
        "We encountered an issue during payment processing. Please refresh the page and try again.",
      );
      return;
    }

    const tab = await getActiveTab();
    if (!tab.id) throw new Error("No active tab found");

    await executeAction(nextAction, tab.id);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { base64, viewport, domContent } = await capturePageState();

    const result = await fetchAI("/automation/continue", {
      sessionId: state.sessionId,
      previousAction: `${nextAction.type} on ${nextAction.target}`,
      actionResult: "Action completed successfully",
      currentUrl: tab.url,
      currentScreenshot: base64,
      viewport,
      domContent,
    });
    console.log("[automation] continue result", result);

    if (!result.success) {
      throw new Error(result.error || "Continue automation failed");
    }

    if (result.isComplete) {
      cleanup();
      callbacks.onComplete();
      return;
    }

    state.currentPlan = result.plan ?? null;

    if (!state.currentPlan || state.currentPlan.length === 0) {
      cleanup();
      callbacks.onError("Automation ended without completing");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  cleanup();
  callbacks.onError("Automation ended without completing");
}

function cleanup(): void {
  if (state.debuggerTabId) {
    detachDebugger(state.debuggerTabId);
  }
  state.sessionId = null;
  state.currentPlan = null;
  state.debuggerTabId = null;
}

export function reset(): void {
  cleanup();
}
