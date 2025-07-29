export interface DetectionContext {
  url: string;
  history: string[];
  screenshot: string;
}

export interface PaymentData {
  amount: number;
  currency: string;
  merchantName: string;
  paymentUrl: string;
}

export interface DetectionResult {
  type: "regular_page" | "almost_payment_page" | "payment_page";
  paymentData?: PaymentData;
}
