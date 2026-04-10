import { api } from "@/lib/api";
import type { BodyParams } from "@/lib/api/types";
import { unwrap } from "@/lib/api/utils/unwrap";
import type { Address } from "viem";

export async function createPaymentIntent(
  body: BodyParams<"/v1/payment-intents">,
) {
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
    expiresAt: new Date(data.expiresAt),
    createdAt: new Date(data.createdAt),
  };
}
