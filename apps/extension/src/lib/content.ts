// Traditional overlay implementation (covers content instead of pushing down)
// Converted from push-down strategy

class URLDetector {
  private patterns: string[];

  constructor() {
    this.patterns = [
      "checkout",
      "payment",
      "cart",
      "order",
      "purchase",
      "pay",
      "billing",
    ];
  }

  detect() {
    const currentUrl = location.href.toLowerCase();
    return this.patterns.some((pattern) => currentUrl.includes(pattern));
  }
}

// Enhanced content script with single toggle message
class TraditionalOverlay {
  private overlayId: string;
  private isActive: boolean;
  private originalOverflow: string | null;
  private originalBodyOverflow: string | null;

  constructor() {
    this.overlayId = "pear-overlay";
    this.isActive = false;
    this.originalOverflow = null;
    this.originalBodyOverflow = null;
  }

  show() {
    if (this.isActive) return;

    try {
      this.originalOverflow = document.documentElement.style.overflow;
      this.originalBodyOverflow = document.body.style.overflow;

      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";

      const overlay = document.createElement("div");
      overlay.id = this.overlayId;

      overlay.innerHTML = `
        <div style="position: absolute; top: 0; left: 0; width: 10px; height: 10px; background: rgb(255,0,255); z-index: 999999;"></div>
        <div style="text-align: center; color: white;">
          <h2>🍐 Processing Payment...</h2>
          <div style="border: 4px solid white; border-top: 4px solid transparent; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto;"></div>
        </div>
      `;

      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        transition: none !important;
      `;

      const style = document.createElement("style");
      style.textContent =
        "@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }";
      document.head.appendChild(style);

      document.body.appendChild(overlay);
      this.isActive = true;
    } catch (error) {
      console.error("🍐 Failed to show overlay:", error);
      this.hide();
    }
  }

  hide() {
    if (!this.isActive) return;

    try {
      const overlay = document.getElementById(this.overlayId);
      if (overlay) overlay.remove();

      if (this.originalOverflow !== null) {
        document.documentElement.style.overflow = this.originalOverflow;
      }
      if (this.originalBodyOverflow !== null) {
        document.body.style.overflow = this.originalBodyOverflow;
      }

      this.isActive = false;
    } catch (error) {
      console.error("🍐 Failed to hide overlay:", error);
      this.isActive = false;
    }
  }

  // Fast toggle: hide and immediately show
  async fastToggle() {
    this.hide();
    await new Promise((resolve) => setTimeout(resolve, 25));

    // await new Promise((resolve) => requestAnimationFrame(resolve));
    this.show();
  }
}

// Initialize components
const urlDetector = new URLDetector();
const traditionalOverlay = new TraditionalOverlay();

// Check for checkout page and show badge
if (urlDetector.detect()) {
  chrome.runtime.sendMessage({ type: "SHOW_BADGE" });
}

// Listen for messages
chrome.runtime.onMessage.addListener(
  (message: any, _: any, sendResponse: any) => {
    console.log("🍐 Content script received message:", message);

    switch (message.type) {
      case "SHOW_PROCESSING_OVERLAY":
        traditionalOverlay.show();
        sendResponse({ success: true });
        break;

      case "HIDE_PROCESSING_OVERLAY":
        traditionalOverlay.hide();
        sendResponse({ success: true });
        break;

      case "FAST_TOGGLE_OVERLAY":
        (async () => {
          console.time("overlay-toggle");
          await traditionalOverlay.fastToggle();
          console.timeEnd("overlay-toggle");
          sendResponse({ success: true });
        })();

        // 👇 this tells Chrome "don’t close the channel yet"
        return true;

      case "CHECK_MARKER":
        const marker = document.getElementById("capture-marker");
        sendResponse({
          exists: !!marker,
          style: marker?.style.cssText,
          position: marker
            ? { top: marker.offsetTop, left: marker.offsetLeft }
            : null,
        });
        break;

      // case "GET_VIEWPORT_INFO":
      //   // For screenshot coordination
      //   sendResponse({
      //     success: true,
      //     viewportInfo: traditionalOverlay.getViewportInfo(),
      //   });
      //   break;

      default:
        sendResponse({ success: false, error: "Unknown message type" });
    }

    return true;
  },
);

// Export for debugging
(window as any).pearTraditionalOverlay = traditionalOverlay;
