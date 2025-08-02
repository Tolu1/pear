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
