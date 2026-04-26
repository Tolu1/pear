import { api } from "@/lib/api";
import type { BodyParams } from "@/lib/api/types";
import { unwrap } from "@/lib/api/utils/unwrap";
import { parseUnits, type Address } from "viem";

const USDC_DECIMALS = 6;

export async function createPaymentIntent(
  body: BodyParams<"/v1/payment-intents">,
) {
  // TODO: remove stub once backend is reachable
  const now = new Date();
  return {
    id: "stub-intent-id",
    quoteId: body.quoteId,
    status: "requires_transfer" as const,
    amount: "0",
    currency: "USD",
    cryptoAmount: parseUnits("0", USDC_DECIMALS),
    tokenId: "usd-coin",
    blockchain: "base",
    contractAddress: "0x0000000000000000000000000000000000000000" as Address,
    paymentAddress: "0x0000000000000000000000000000000000000000" as Address,
    fromAddress: body.fromAddress as Address,
    merchantDomain: body.merchantDomain,
    metadata: null,
    expiresAt: new Date(now.getTime() + 5 * 60 * 1000),
    createdAt: now,
  };

  return mapper(await fetcher(body));
}

async function fetcher(body: BodyParams<"/v1/payment-intents">) {
  return unwrap(api.POST("/v1/payment-intents", { body }));
}

function mapper(data: Awaited<ReturnType<typeof fetcher>>) {
  return {
    ...data,
    contractAddress: data.contractAddress as Address,
    paymentAddress: data.paymentAddress as Address,
    fromAddress: data.fromAddress as Address,
    cryptoAmount: parseUnits(data.cryptoAmount, USDC_DECIMALS),
    expiresAt: new Date(data.expiresAt),
    createdAt: new Date(data.createdAt),
  };
}
