import { ai } from "@/lib/ai";
import type { DetectedPayment } from "@/interfaces/detected-payment";

interface DetectPaymentBody {
  url: string;
  screenshot: string;
}

interface DetectPaymentResponse {
  type: "regular_page" | "almost_payment_page" | "payment_page";
  paymentData?: {
    amount: string;
    currency: string;
    merchantDomain: string;
  } | null;
}

export async function detectPayment(body: DetectPaymentBody) {
  return mapper(await fetcher(body));
}

async function fetcher(body: DetectPaymentBody) {
  return ai.post<DetectPaymentResponse>("/detection", body);
}

function mapper(data: Awaited<ReturnType<typeof fetcher>>) {
  const paymentData: DetectedPayment | null = data.paymentData
    ? {
        amount: data.paymentData.amount,
        currencyCode: data.paymentData.currency.toUpperCase(),
        merchantDomain: data.paymentData.merchantDomain,
      }
    : null;
  return { type: data.type, paymentData };
}
