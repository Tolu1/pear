import { jumia } from "./payment-processor/adapters/jumia";

function isCheckoutPage() {
  const patterns = [
    "checkout",
    "payment",
    "cart",
    "order",
    "purchase",
    "pay",
    "billing",
  ];
  const currentUrl = location.href.toLowerCase();

  const isCheckoutUrl = patterns.some((pattern) =>
    currentUrl.includes(pattern)
  );

  if (isCheckoutUrl) {
    chrome.runtime.sendMessage({ type: "CHECKOUT_DETECTED" }, (response) => {
      console.log("Checkout detected:", response);
    });
  }
}

isCheckoutPage();

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  console.log("Content: Received message:", message);

  if (message.type === "RUN_JUMIA_AUTOMATION") {
    console.log("Content: Starting automation...");
    runAutomation()
      .then((result) => {
        console.log("Content: Automation completed:", result);
        sendResponse(result);
      })
      .catch((error) => {
        console.log("Content: Automation failed:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Will respond asynchronously
  }
});

async function runAutomation() {
  const context = { url: window.location.href, document };
  const paymentData = await jumia.extract(context);
  return await jumia.pay(paymentData);
}
