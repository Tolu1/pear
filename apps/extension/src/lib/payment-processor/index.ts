/**
 * Pear Payment Processor
 *
 * Handles full payment page workflows — from detecting checkout pages
 * to extracting payment details and submitting the payment.
 * Supports multiple strategies (adapters) for different platforms.
 */

import type {
  DetectionContext,
  PaymentPayload,
  PaymentResult,
  PaymentAdapter,
} from "./types";
import { jumia } from "./adapters/jumia";
import { sportybet } from "./adapters/sportybet";
import { paystack } from "./adapters/paystack";
import { generic } from "./adapters/generic";
import { ai } from "./adapters/ai";

type Method = "jumia" | "sportybet" | "paystack" | "generic" | "ai" | string;

export interface IPaymentProcessor {
  use(method: Method): PaymentProcessor;
  detect(context: DetectionContext): Promise<boolean>;
  extract(context: DetectionContext): Promise<PaymentPayload>;
  pay(payload: PaymentPayload): Promise<PaymentResult>;
  register(methodName: string, adapter: PaymentAdapter): PaymentProcessor;
  getAvailableMethods(): string[];
}

export class PaymentProcessor implements IPaymentProcessor {
  private adapters: Map<string, PaymentAdapter> = new Map();
  private selectedMethod: string = "generic";

  constructor() {
    this.register("jumia", jumia);
    this.register("sportybet", sportybet);
    this.register("paystack", paystack);
    this.register("generic", generic);
    this.register("ai", ai);
  }

  public use(method: Method): PaymentProcessor {
    if (!this.adapters.has(method)) {
      console.warn(
        `PaymentProcessor: Unknown method '${method}', falling back to 'generic'`
      );
      this.selectedMethod = "generic";
    } else {
      this.selectedMethod = method;
    }
    return this;
  }

  public async detect(context: DetectionContext): Promise<boolean> {
    return this.getAdapterOrThrow().detect(context);
  }

  public async extract(context: DetectionContext): Promise<PaymentPayload> {
    return this.getAdapterOrThrow().extract(context);
  }

  public async pay(payload: PaymentPayload): Promise<PaymentResult> {
    return this.getAdapterOrThrow().pay(payload);
  }

  public register(
    methodName: string,
    adapter: PaymentAdapter
  ): PaymentProcessor {
    this.adapters.set(methodName, adapter);
    return this;
  }

  public getCurrentMethod(): string {
    return this.selectedMethod;
  }

  public getAvailableMethods(): string[] {
    return Array.from(this.adapters.keys());
  }

  private getAdapterOrThrow(): PaymentAdapter {
    const adapter = this.adapters.get(this.selectedMethod);
    if (!adapter) {
      throw new Error(`Adapter not found for method: ${this.selectedMethod}`);
    }
    return adapter;
  }
}
