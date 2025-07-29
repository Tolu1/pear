import type {
  DetectionContext,
  DetectionResult,
  PaymentData,
} from "@/lib/types";

export class Detector {
  private currentResult: DetectionResult | null = null;

  detect(context: DetectionContext): DetectionResult {
    const { url } = context;

    if (url.includes("/checkout") && !url.includes("payment")) {
      this.currentResult = { type: "almost_payment_page" };
      return this.currentResult;
    }

    if (url.includes("pay.jumia.com.ng/checkout/payment")) {
      this.currentResult = {
        type: "payment_page",
        paymentData: this.extract(context),
      };
      return this.currentResult;
    }

    this.currentResult = { type: "regular_page" };
    return this.currentResult;
  }

  private extract(context: DetectionContext): PaymentData {
    // TODO: Use AI to extract from screenshot
    return {
      amount: 0,
      currency: "NGN",
      merchantName: "Jumia",
      paymentUrl: context.url,
    };
  }

  getLatestResult(): DetectionResult | null {
    return this.currentResult;
  }
}
