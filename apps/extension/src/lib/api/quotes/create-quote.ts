import { api } from "@/lib/api";
import type { BodyParams } from "@/lib/api/types";
import { unwrap } from "@/lib/api/utils/unwrap";
import type { Quote } from "@/interfaces/quote";

export async function createQuote(body: BodyParams<"/v1/quotes">): Promise<Quote> {
  // TODO: remove stub once backend is reachable
  const now = new Date();
  return {
    id: "stub-quote-id",
    amount: body.amount,
    currency: body.currency,
    cryptoAmount: body.amount,
    tokenId: body.tokenId,
    blockchain: body.blockchain,
    expiresAt: new Date(now.getTime() + 5 * 60 * 1000),
    createdAt: now,
  };

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
