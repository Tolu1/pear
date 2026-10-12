import { api } from "@/lib/api";
import type { BodyParams } from "@/lib/api/types";
import { unwrap } from "@/lib/api/utils/unwrap";
import type { Quote } from "@/interfaces/quote";

export async function createQuote(
  body: BodyParams<"/v1/quotes">,
): Promise<Quote> {
  return mapper(await fetcher(body));
}

async function fetcher(body: BodyParams<"/v1/quotes">) {
  return unwrap(api.POST("/v1/quotes", { body }));
}

function mapper(data: Awaited<ReturnType<typeof fetcher>>): Quote {
  return {
    id: data.id,
    amount: data.amount,
    currencyCode: String(data.currencyCode),
    cryptoAmount: data.cryptoAmount,
    tokenId: data.tokenId,
    expiresAt: new Date(data.expiresAt),
    createdAt: new Date(data.createdAt),
  };
}
