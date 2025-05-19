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
