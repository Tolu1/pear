import { api } from "@/lib/api";
import type { PathParams } from "@/lib/api/types";
import { unwrap } from "@/lib/api/utils/unwrap";

export async function getCard(
  path: PathParams<"/v1/payment-intents/{id}/card">,
) {
  // TODO: remove stub once backend is reachable
  return {
    number: "4111111111111111",
    expiry: "12/30",
    cvv: "123",
    name: "Test User",
  };

  return mapper(await fetcher(path));
}

async function fetcher(path: PathParams<"/v1/payment-intents/{id}/card">) {
  return unwrap(api.GET("/v1/payment-intents/{id}/card", { params: { path } }));
}

function mapper(data: Awaited<ReturnType<typeof fetcher>>) {
  return data;
}
