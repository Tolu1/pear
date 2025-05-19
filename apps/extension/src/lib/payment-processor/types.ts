export interface DetectionContext {
  url: string;
  document: Document;
  history?: string[];
}

type Currency = "NGN" | "USD" | "EUR" | "GBP";

export type PaymentPayload = {
  paymentUrl: string;
  amount: number;
  currency: Currency;
  domain: string;
  cookies: string[];
};

export type PaymentPayloadDraft = {
  domain: string;
  paymentUrl: string;
  amount: number;
  currency: Currency;
  crypto: string;
  network: string;
  address: string;
  cookies: string[];
  method: string;
};

export type PaymentResult = {
  success: boolean;
  redirectUrl: string | null;
  error: string | null;
};

export interface PaymentAdapter {
  detect(context: DetectionContext): Promise<boolean>;
  extract(context: DetectionContext): Promise<PaymentPayload>;
  pay(data: PaymentPayload): Promise<PaymentResult>;
}
