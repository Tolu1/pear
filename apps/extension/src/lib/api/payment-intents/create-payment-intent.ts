import { api } from "@/lib/api";
import type { BodyParams } from "@/lib/api/types";
import { unwrap } from "@/lib/api/utils/unwrap";
import type { PaymentIntent } from "@/interfaces/payment-intent";
import { parseUnits, type Address } from "viem";

const USDC_DECIMALS = 6;

export async function createPaymentIntent(
  body: BodyParams<"/v1/payment-intents">,
): Promise<PaymentIntent> {
  return mapper(await fetcher(body));
}

async function fetcher(body: BodyParams<"/v1/payment-intents">) {
  return unwrap(api.POST("/v1/payment-intents", { body }));
}

function mapper(data: Awaited<ReturnType<typeof fetcher>>): PaymentIntent {
  return {
    id: data.id,
    quoteId: data.quote.id,
    railId: data.rail.id,
    status: data.status,
    amount: data.quote.amount,
    currencyCode: String(data.quote.currencyCode),
    cryptoAmount: parseUnits(data.quote.cryptoAmount, USDC_DECIMALS),
    tokenId: data.quote.tokenId,
    contractAddress: data.rail.tokenAddress as Address,
    paymentAddress: data.rail.paymentAddress as Address,
    fromAddress: data.fromAddress as Address,
    merchantDomain: data.merchantDomain,
    metadata: data.metadata,
    expiresAt: new Date(data.expiresAt),
    createdAt: new Date(data.createdAt),
  };
}
