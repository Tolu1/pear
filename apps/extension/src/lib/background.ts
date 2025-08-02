export interface MessageResponse {
  success?: boolean;
  data?: any | null;
  error?: string;
}

export interface ShowBadgeMessage {
  type: "SHOW_BADGE";
}

export type ChromeMessage = ShowBadgeMessage;

chrome.runtime.onMessage.addListener(
  (message: ChromeMessage, _, sendResponse) => {
    if (message.type === "SHOW_BADGE") {
      chrome.action.setBadgeText({ text: "✓" });
      chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
      sendResponse({ success: true });
    }

    return false;
  },
);

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id, windowId: tab.windowId }, () => {});
});
