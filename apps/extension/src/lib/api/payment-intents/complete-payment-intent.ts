import { api } from "@/lib/api";
import type { PathParams } from "@/lib/api/types";

export async function completePaymentIntent(
  path: PathParams<"/v1/payment-intents/{id}/complete">,
) {
  await api.POST("/v1/payment-intents/{id}/complete", { params: { path } });
}
