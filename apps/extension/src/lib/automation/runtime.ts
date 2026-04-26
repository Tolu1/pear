import type { AutomationAction } from "./interfaces/automation-action";

export async function attachDebugger(tabId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const debuggee = { tabId };

    chrome.debugger.attach(debuggee, "1.0", () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      chrome.debugger.sendCommand(debuggee, "DOM.enable", {}, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        chrome.debugger.sendCommand(debuggee, "Runtime.enable", {}, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    });
  });
}

export function detachDebugger(tabId: number): void {
  chrome.debugger.detach({ tabId });
}

export async function executeAction(
  action: AutomationAction,
  tabId: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const debuggee = { tabId };

    switch (action.type) {
      case "click":
        if (!action.coordinates) {
          reject(new Error("No coordinates provided for click action"));
          return;
        }
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
                x: action.coordinates!.x,
                y: action.coordinates!.y,
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
        break;

      case "type":
        if (!action.content) {
          reject(new Error("No content provided for type action"));
          return;
        }
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
        setTimeout(resolve, 2000);
        break;

      default:
        resolve();
    }
  });
}
