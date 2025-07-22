// import { jumia } from "@/lib/payment-processor/adapters/jumia";

export interface MessageResponse {
  success?: boolean;
  data?: any | null;
  error?: string;
}

export interface CheckoutDetectedMessage {
  type: "CHECKOUT_DETECTED";
}

export interface GetCheckoutStateMessage {
  type: "GET_CHECKOUT_STATE";
}

export interface TestJumiaAutomationMessage {
  type: "TEST_JUMIA_AUTOMATION";
}

export type ChromeMessage =
  | CheckoutDetectedMessage
  | GetCheckoutStateMessage
  | TestJumiaAutomationMessage;

let checkoutState = false;

chrome.runtime.onMessage.addListener(
  (message: ChromeMessage, _, sendResponse) => {
    if (message.type === "CHECKOUT_DETECTED") {
      chrome.action.setBadgeText({ text: "✓" });
      chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
      checkoutState = true;

      sendResponse({ success: true });
    }

    if (message.type === "GET_CHECKOUT_STATE") {
      sendResponse({ data: { checkoutState } });
    }

    if (message.type === "TEST_JUMIA_AUTOMATION") {
      handleTestAutomation().then(sendResponse);
      return true;
    }

    return false;
  }
);

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id, windowId: tab.windowId }, () => {});
});

// async function handleTestAutomation(): Promise<MessageResponse> {
//   try {
//     console.log("Background: Starting Jumia automation test...");

//     // Get active tab
//     const [tab] = await chrome.tabs.query({
//       active: true,
//       currentWindow: true,
//     });
//     if (!tab.id) {
//       throw new Error("No active tab found");
//     }

//     console.log("Background: Injecting automation script into tab", tab.id);

//     // Inject and execute the EXISTING Jumia adapter
//     const results = await chrome.scripting.executeScript({
//       target: { tabId: tab.id },
//       func: async () => {
//         const jumia = (window as any).jumia;
//         console.log("Content: Using actual Jumia adapter flow");
//         console.log("Content: Received jumia:", jumia);
//         console.log("Content: jumia.detect exists:", typeof jumia.detect);

//         const context = {
//           url: window.location.href,
//           document: document,
//         };
//         console.log("Content: Created context:", context.url);

//         const isCheckout = await jumia.detect(context);
//         console.log("Content: Detection result:", isCheckout);
//         if (!isCheckout) {
//           throw new Error("Not a valid checkout page");
//         }

//         const paymentData = await jumia.extract(context);
//         console.log("Extracted payment data:", paymentData);

//         const result = await jumia.pay(paymentData);
//         console.log("Content: Payment result:", result);

//         return result;
//       },
//     });

//     const result = results[0].result;
//     console.log("Background: Automation completed:", result);

//     return {
//       success: true,
//       data: result,
//     };
//   } catch (error) {
//     console.error("Background: Automation test failed:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// }

// Background script (has chrome.debugger access)

// async function handleTestAutomation(): Promise<MessageResponse> {
//   try {
//     const [tab] = await chrome.tabs.query({
//       active: true,
//       currentWindow: true,
//     });

//     await chrome.debugger.attach({ tabId: tab.id }, "1.3");
//     const text = "TEST123";
//     for (const char of text) {
//       await chrome.debugger.sendCommand(
//         { tabId: tab.id },
//         "Input.dispatchKeyEvent",
//         {
//           type: "keyDown",
//           text: char,
//         }
//       );
//       await chrome.debugger.sendCommand(
//         { tabId: tab.id },
//         "Input.dispatchKeyEvent",
//         {
//           type: "keyUp",
//           text: char,
//         }
//       );
//     }
//     await chrome.debugger.detach({ tabId: tab.id });

//     return { success: true };
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// }

async function handleTestAutomation(): Promise<MessageResponse> {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    await chrome.debugger.attach({ tabId: tab.id }, "1.3");

    // Move mouse to specific coordinates (adjust as needed)
    const x = 500;
    const y = 300;

    await chrome.debugger.sendCommand(
      { tabId: tab.id },
      "Input.dispatchMouseEvent",
      {
        type: "mouseMoved",
        x: x,
        y: y,
      }
    );

    // Small delay to see the movement
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Click at that position
    await chrome.debugger.sendCommand(
      { tabId: tab.id },
      "Input.dispatchMouseEvent",
      {
        type: "mousePressed",
        x: x,
        y: y,
        button: "right",
        clickCount: 1,
      }
    );

    await chrome.debugger.sendCommand(
      { tabId: tab.id },
      "Input.dispatchMouseEvent",
      {
        type: "mouseReleased",
        x: x,
        y: y,
        button: "right",
        clickCount: 1,
      }
    );

    await chrome.debugger.detach({ tabId: tab.id });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
