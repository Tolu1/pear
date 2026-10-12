import { detectPayment } from "@/lib/ai/detection/detect-payment";
import { createQuote } from "@/lib/api/quotes/create-quote";
import { getActiveTab } from "@/lib/browser/get-active-tab";
import { captureScreenshot } from "@/lib/browser/capture-screenshot";
import { useDetectedPaymentStore } from "@/stores/detected-payment.store";
import { useQuoteStore } from "@/stores/quote.store";
import { usePaymentScreenStore } from "@/stores/payment-screen.store";

export async function checkForPaymentPage(): Promise<void> {
  const { setScreen } = usePaymentScreenStore.getState();
  const { setPayment } = useDetectedPaymentStore.getState();
  const { setQuote } = useQuoteStore.getState();

  setScreen("scanning");

  const tab = await getActiveTab();
  const screenshot = await captureScreenshot();
  const detection = await detectPayment({
    url: tab.url ?? "",
    screenshot,
  });

  if (detection.type === "regular_page") {
    setScreen("idle");
    return;
  }

  if (detection.type === "almost_payment_page") {
    setScreen("almost-detected");
    return;
  }

  if (!detection.paymentData) {
    throw new Error("Payment page detected but no payment data returned");
  }

  const quote = await createQuote({
    amount: detection.paymentData.amount,
    currencyCode: detection.paymentData.currencyCode as "NGN" | "USD",
    tokenId: "usd-coin",
  });

  setPayment(detection.paymentData);
  setQuote(quote);
  setScreen("detected");
}
