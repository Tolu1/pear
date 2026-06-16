import { ai } from "@/lib/ai";

interface StartCheckoutBody {
  intentId: string;
}

interface StartCheckoutResponse {
  sessionId: string;
}

export function startCheckout(
  body: StartCheckoutBody,
): Promise<StartCheckoutResponse> {
  return ai.post<StartCheckoutResponse>("/checkout", body);
}
