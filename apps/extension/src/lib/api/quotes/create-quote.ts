import { api } from "@/lib/api";
import type { BodyParams } from "@/lib/api/types";
import { unwrap } from "@/lib/api/utils/unwrap";

export async function createQuote(body: BodyParams<"/v1/quotes">) {
  return mapper(await fetcher(body));
}

async function fetcher(body: BodyParams<"/v1/quotes">) {
  return unwrap(api.POST("/v1/quotes", { body }));
}

function mapper(data: Awaited<ReturnType<typeof fetcher>>) {
  return {
    ...data,
    expiresAt: new Date(data.expiresAt),
    createdAt: new Date(data.createdAt),
  };
}
