import { api } from "@/lib/api";
import type { BodyParams, PathParams } from "@/lib/api/types";
import { unwrap } from "@/lib/api/utils/unwrap";

export async function submitPaymentIntent(
  path: PathParams<"/v1/payment-intents/{id}/submit", "post">,
  body: BodyParams<"/v1/payment-intents/{id}/submit">,
) {
  return unwrap(
    api.POST("/v1/payment-intents/{id}/submit", { params: { path }, body }),
  );
}
