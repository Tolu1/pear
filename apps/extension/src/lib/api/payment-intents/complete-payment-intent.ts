import { api } from "@/lib/api";
import type { PathParams } from "@/lib/api/types";

export async function completePaymentIntent(
  path: PathParams<"/v1/payment-intents/{id}/complete", "post">,
) {
  // TODO: remove stub once backend is reachable
  void path;
  return;

  await api.POST("/v1/payment-intents/{id}/complete", { params: { path } });
}
