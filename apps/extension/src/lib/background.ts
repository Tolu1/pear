import { Detector } from "@/lib/core/detector";
import type { DetectionContext } from "@/lib/types";

type PageChangedMessage = {
  type: "PAGE_CHANGED";
  context: DetectionContext;
};

type RuntimeMessage = PageChangedMessage;

const detector = new Detector();

chrome.runtime.onMessage.addListener(
  async (message: RuntimeMessage, _, sendResponse) => {
    if (message.type === "PAGE_CHANGED") {
      console.log("🔥 Background received PAGE_CHANGED");

      const screenshot = await chrome.tabs.captureVisibleTab();
      const context = {
        ...message.context,
        screenshot,
      };

      const previousResult = detector.getLatestResult();
      const newResult = detector.detect(context);

      if (JSON.stringify(previousResult) !== JSON.stringify(newResult)) {
        chrome.runtime
          .sendMessage({
            type: "DETECTION_CHANGED",
            detectionResult: newResult,
          })
          .catch(() => {});
      }
    }

    sendResponse({ success: true });
    return false;
  }
);

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id, windowId: tab.windowId });
});
