export interface PaymentData {
  checkoutUrl: string;
  merchantName: string;
  totalAmount: string | null;
  currency: string;
  timestamp: string;
  formInputs: Record<string, string>;
  pageDetails?: {
    title: string;
    url: string;
    domain: string;
  };
  detectedElements?: string[];
}

export interface MessageResponse {
  success?: boolean;
  data?: PaymentData | null;
  error?: string;
}

export interface CheckoutDetectedMessage {
  type: "CHECKOUT_DETECTED";
  data: PaymentData;
}

export interface GetCheckoutDataMessage {
  type: "GET_CHECKOUT_DATA";
}

export type ChromeMessage = CheckoutDetectedMessage | GetCheckoutDataMessage;
