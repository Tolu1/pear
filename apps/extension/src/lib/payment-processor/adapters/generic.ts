import type {
  PaymentAdapter,
  DetectionContext,
  PaymentPayload,
  PaymentResult,
} from "../types";

export const generic: PaymentAdapter = {
  async detect(context: DetectionContext): Promise<boolean> {
    throw new Error("Not implemented for " + context.url);
  },

  async extract(context: DetectionContext): Promise<PaymentPayload> {
    throw new Error("Not implemented for " + context.url);
  },

  async pay(data: PaymentPayload): Promise<PaymentResult> {
    throw new Error("Not implemented for " + data.paymentUrl);
  },
};
