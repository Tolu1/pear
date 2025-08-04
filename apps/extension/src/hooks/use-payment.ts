import { create } from "zustand";
import { getActiveTab, getViewportInfo, getDOMContent } from "@/lib/utils";

export type PaymentStep =
  | "idle"
  | "almost-detected"
  | "detected"
  | "checking"
  | "confirming"
  | "processing"
  | "success"
  | "failed"
  | "warning";

export interface Detection {
  type: "regular_page" | "almost_payment_page" | "payment_page";
  paymentData: PaymentData;
}

export interface PaymentData {
  price: string;
  merchantDomain: string;
  paymentUrl: string;
}

export interface Payment {
  amount: number;
  currency: string;
  merchant: string;
  conversion: {
    rate: number;
    from: string;
    to: string;
    total: number;
  };
  fees: {
    network: number;
    pear: number;
  };
}

export interface AutomationAction {
  type:
    | "user_action_required"
    | "click"
    | "type"
    | "scroll"
    | "wait"
    | "navigate"
    | "complete";
  target?: string;
  content?: string;
  coordinates?: { x: number; y: number };
  reasoning: string;
  userMessage?: string;
}

export interface AutomationPlan {
  reasoning: string;
  actions: AutomationAction[];
  isComplete: boolean;
  nextStep?: string;
}

interface PaymentStore {
  step: PaymentStep;
  payment: PaymentData | null;
  isDetecting: boolean;
  automationSessionId: string | null;
  currentPlan: AutomationAction[] | null;
  error: string | null;
  userWarning: string | null;
  debuggerTabId: number | null;
  detect: () => void;
  pay: () => Promise<void>;
  startAutomation: (goal: string) => Promise<void>;
  executeNextAction: () => Promise<void>;
  reset: () => void;
}

export const usePayment = create<PaymentStore>((set, get) => ({
  step: "idle",
  payment: null,
  isDetecting: false,
  automationSessionId: null,
  currentPlan: null,
  error: null,
  userWarning: null,
  debuggerTabId: null,

  detect: async () => {
    set({ isDetecting: true, error: null });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const tab = await getActiveTab();
      const dataUrl = await chrome.tabs.captureVisibleTab();
      const base64 = dataUrl.split(",")[1];
      console.log("Screenshot being sent:", dataUrl);

      const response = await fetch("http://localhost:3000/detection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: tab.url,
          screenshot: base64,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 529) {
          throw new Error(
            "Our servers are currently overloaded. Please try again shortly.",
          );
        }
        throw new Error(`Something went wrong (Error ${response.status}).`);
      }

      const detection: Detection = await response.json();

      if (detection.type === "almost_payment_page") {
        set({ step: "almost-detected", isDetecting: false });
      } else if (detection.type === "payment_page") {
        set({
          step: "detected",
          payment: detection.paymentData,
          isDetecting: false,
        });
      } else {
        set({ isDetecting: false });
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      let errorMessage = error.message;
      if (error.name === "AbortError") {
        errorMessage = "We're having trouble analyzing this page";
      }
      set({ step: "failed", isDetecting: false, error: errorMessage });
    }
  },

  startAutomation: async (goal: string) => {
    set({ step: "checking", error: null });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const tab = await getActiveTab();
      const dataUrl = await chrome.tabs.captureVisibleTab();
      const base64 = dataUrl.split(",")[1];
      const viewport = await getViewportInfo();
      const domContent = await getDOMContent();

      const response = await fetch("http://localhost:3000/automation/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal,
          url: tab.url,
          screenshot: base64,
          viewport,
          domContent,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 529) {
          throw new Error(
            "Our servers are currently overloaded. Please try again shortly.",
          );
        }
        throw new Error(`Something went wrong (Error ${response.status}).`);
      }

      const result = await response.json();

      console.log("Automation started:", result);

      if (result.debugScreenshot) {
        console.log(
          "Processed screenshot from start automation:",
          `data:image/jpeg;base64,${result.debugScreenshot}`,
        );
      }

      if (result.success) {
        set({
          automationSessionId: result.sessionId,
          currentPlan: result.plan,
        });

        if (result.plan && result.plan.length > 0) {
          const firstAction = result.plan[0];
          if (firstAction.type === "user_action_required") {
            set({
              step: "warning",
              userWarning:
                firstAction.userMessage ||
                "Please complete the required fields before proceeding",
              currentPlan: null,
              automationSessionId: null,
            });
          } else {
            set({ step: "confirming" });

            await new Promise((resolve) => setTimeout(resolve, 1000));
            set({ step: "processing" });

            if (tab.id) {
              await attachDebugger(tab.id);
              set({ debuggerTabId: tab.id });
            }
            get().executeNextAction();
          }
        }
      } else {
        throw new Error(result.error || "Automation failed to start");
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      let errorMessage = error.message;
      if (error.name === "AbortError") {
        errorMessage = "Automation request timed out";
      }
      set({
        step: "failed",
        error: errorMessage,
        automationSessionId: null,
        currentPlan: null,
      });
    }
  },

  executeNextAction: async () => {
    const { currentPlan, automationSessionId, debuggerTabId } = get();

    if (!currentPlan || currentPlan.length === 0) {
      return;
    }

    const nextAction = currentPlan[0];

    if (nextAction.type === "user_action_required") {
      if (debuggerTabId) {
        chrome.debugger.detach({ tabId: debuggerTabId });
      }

      set({
        step: "failed",
        error:
          "We encountered an issue during payment processing. Please refresh the page and try again.",
        currentPlan: null,
        automationSessionId: null,
        debuggerTabId: null,
      });
      return;
    }

    try {
      const tab = await getActiveTab();

      if (!tab.id) {
        throw new Error("No active tab found");
      }

      // Use the already attached debugger
      await executeAction(nextAction, tab.id);

      // Wait for action to take effect
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Continue automation
      const dataUrl = await chrome.tabs.captureVisibleTab();
      const base64 = dataUrl.split(",")[1];
      const viewport = await getViewportInfo();
      const domContent = await getDOMContent();

      if (automationSessionId) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
          const response = await fetch(
            "http://localhost:3000/automation/continue",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sessionId: automationSessionId,
                previousAction: `${nextAction.type} on ${nextAction.target}`,
                actionResult: "Action completed successfully",
                currentUrl: tab.url,
                currentScreenshot: base64,
                viewport,
                domContent,
              }),
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

          const result = await response.json();

          if (result.debugScreenshot) {
            console.log(
              "Processed screenshot from continue automation:",
              `data:image/jpeg;base64,${result.debugScreenshot}`,
            );
          }

          if (result.success) {
            if (result.isComplete) {
              // Detach debugger when automation is complete
              if (debuggerTabId) {
                chrome.debugger.detach({ tabId: debuggerTabId });
              }
              set({
                step: "success",
                currentPlan: null,
                automationSessionId: null,
                debuggerTabId: null,
                error: null,
              });
            } else {
              set({ currentPlan: result.plan });
              // Continue with next action
              if (result.plan && result.plan.length > 0) {
                setTimeout(() => get().executeNextAction(), 500);
              }
            }
          } else {
            throw new Error(result.error || "Continue automation failed");
          }
        } catch (error: any) {
          clearTimeout(timeoutId);
          let errorMessage = error.message;
          if (error.name === "AbortError") {
            errorMessage = "Payment processing is taking longer than expected";
          }

          // Detach debugger on error
          if (debuggerTabId) {
            chrome.debugger.detach({ tabId: debuggerTabId });
          }

          set({
            step: "failed",
            error: errorMessage,
            currentPlan: null,
            automationSessionId: null,
            debuggerTabId: null,
          });
        }
      }
    } catch (error: any) {
      // Detach debugger on error
      if (debuggerTabId) {
        chrome.debugger.detach({ tabId: debuggerTabId });
      }

      set({
        step: "failed",
        error: error.message,
        currentPlan: null,
        automationSessionId: null,
        debuggerTabId: null,
      });
    }
  },

  pay: async () => {
    const { payment } = get();

    if (payment) {
      await get().startAutomation("click the pay button and complete payment");
    } else {
      set({
        step: "failed",
        error:
          "We couldn't detect a payment form on this page. Please make sure you're on a checkout page and try again.",
      });
    }
  },

  reset: () => {
    const { debuggerTabId } = get();

    // Detach debugger if attached
    if (debuggerTabId) {
      chrome.debugger.detach({ tabId: debuggerTabId });
    }

    set({
      step: "idle",
      payment: null,
      isDetecting: false,
      automationSessionId: null,
      currentPlan: null,
      error: null,
      userWarning: null,
      debuggerTabId: null,
    });
  },
}));

// Attach debugger once per automation session
async function attachDebugger(tabId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const debuggee = { tabId };

    chrome.debugger.attach(debuggee, "1.0", () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        // Enable required domains
        chrome.debugger.sendCommand(debuggee, "DOM.enable", {}, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            chrome.debugger.sendCommand(debuggee, "Runtime.enable", {}, () => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve();
              }
            });
          }
        });
      }
    });
  });
}

// Execute action using already attached debugger
async function executeAction(
  action: AutomationAction,
  tabId: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const debuggee = { tabId };

    switch (action.type) {
      case "click":
        if (action.coordinates) {
          chrome.debugger.sendCommand(
            debuggee,
            "Input.dispatchMouseEvent",
            {
              type: "mousePressed",
              x: action.coordinates.x,
              y: action.coordinates.y,
              button: "left",
              clickCount: 1,
            },
            () => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
              }
              chrome.debugger.sendCommand(
                debuggee,
                "Input.dispatchMouseEvent",
                {
                  type: "mouseReleased",
                  x: action.coordinates?.x,
                  y: action.coordinates?.y,
                  button: "left",
                  clickCount: 1,
                },
                () => {
                  if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                  } else {
                    resolve();
                  }
                },
              );
            },
          );
        } else {
          reject(new Error("No coordinates provided for click action"));
        }
        break;

      case "type":
        if (action.content) {
          chrome.debugger.sendCommand(
            debuggee,
            "Input.insertText",
            { text: action.content },
            () => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve();
              }
            },
          );
        } else {
          reject(new Error("No content provided for type action"));
        }
        break;

      case "scroll":
        chrome.debugger.sendCommand(
          debuggee,
          "Input.dispatchMouseEvent",
          {
            type: "mouseWheel",
            x: 500,
            y: 500,
            deltaX: 0,
            deltaY: 300,
          },
          () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          },
        );
        break;

      case "wait":
        setTimeout(() => {
          resolve();
        }, 2000);
        break;

      default:
        resolve();
    }
  });
}
