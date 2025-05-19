import type {
  PaymentAdapter,
  DetectionContext,
  PaymentPayload,
  PaymentResult,
} from "../types";

export const jumia: PaymentAdapter = {
  async detect(context: DetectionContext): Promise<boolean> {
    const { url, document } = context;

    const urlMatches = url.match("/pay.jumia.com.ng/checkout/payment/add/");
    const payNowButton = document.querySelector("#pay-now-btn");
    const paymentMethodCards = document.querySelectorAll(
      ".payment-method-card"
    );
    const hasPaymentMethods =
      paymentMethodCards && paymentMethodCards.length > 0;
    const paymentAmountElement = document.querySelector(".payment-amount");
    const jumiaPayLogo = document.querySelector('img[alt="JumiaPay"]');

    let matchCount = 0;
    if (urlMatches) matchCount++;
    if (payNowButton) matchCount++;
    if (hasPaymentMethods) matchCount++;
    if (paymentAmountElement) matchCount++;
    if (jumiaPayLogo) matchCount++;

    return matchCount >= 4;
  },

  async extract(context: DetectionContext): Promise<PaymentPayload> {
    const { url, document } = context;
    const paymentUrl = url;
    const amountString = document.querySelector(".payment-amount")?.textContent;
    if (!amountString) {
      throw new Error("Jumia Adapter: Amount not found");
    }
    const amount = parseFloat(amountString.replace(/[₦,]/g, ""));
    const currency = "NGN";
    const domain = "pay.jumia.com.ng";
    const cookies = document.cookie.split(";").map((cookie) => cookie.trim());

    return {
      paymentUrl,
      amount,
      currency,
      domain,
      cookies,
    };
  },

  async pay(data: PaymentPayload): Promise<PaymentResult> {
    throw new Error("Not implemented for " + data.paymentUrl);
  },
};
