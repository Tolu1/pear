import { api } from "@/lib/api";
import type { PathParams } from "@/lib/api/types";
import { unwrap } from "@/lib/api/utils/unwrap";

export async function getStatus(
  path: PathParams<"/v1/payment-intents/{id}/status">,
) {
  return mapper(await fetcher(path));
}

async function fetcher(path: PathParams<"/v1/payment-intents/{id}/status">) {
  return unwrap(
    api.GET("/v1/payment-intents/{id}/status", { params: { path } }),
  );
}

function mapper(data: Awaited<ReturnType<typeof fetcher>>) {
  return data;
}
