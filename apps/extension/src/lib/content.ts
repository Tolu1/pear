import { showMascot, updateMascotPosition, hideMascot } from "./mascot";

class URLDetector {
  private patterns = [
    "checkout",
    "payment",
    "cart",
    "order",
    "purchase",
    "pay",
    "billing",
  ];

  detect(): boolean {
    const currentUrl = location.href.toLowerCase();
    return this.patterns.some((pattern) => currentUrl.includes(pattern));
  }
}

const urlDetector = new URLDetector();

if (urlDetector.detect()) {
  chrome.runtime.sendMessage({ type: "SHOW_BADGE" });
}

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  switch (message.type) {
    case "SHOW_MASCOT":
      showMascot(message.coordinates);
      sendResponse({ success: true });
      break;
    case "UPDATE_MASCOT_POSITION": // <-- Add this
      updateMascotPosition(message.coordinates);
      sendResponse({ success: true });
      break;
    case "HIDE_MASCOT":
      hideMascot();
      sendResponse({ success: true });
      break;
  }
});
