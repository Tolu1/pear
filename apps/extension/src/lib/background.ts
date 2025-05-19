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

export type ChromeMessage = CheckoutDetectedMessage | GetCheckoutStateMessage;

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

    return false;
  }
);
