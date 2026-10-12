import { api } from "@/lib/api";
import { unwrap } from "@/lib/api/utils/unwrap";
import type { SupportedToken } from "@/interfaces/supported-token";
import type { Address } from "viem";

export async function getSupportedTokens(): Promise<SupportedToken[]> {
  return mapper(await fetcher());
}

async function fetcher() {
  return unwrap(api.GET("/v1/tokens"));
}

function mapper(data: Awaited<ReturnType<typeof fetcher>>): SupportedToken[] {
  return data.map((token) => ({
    id: token.id,
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    rails: token.rails.map((rail) => ({
      id: rail.id,
      chainId: rail.chainId,
      network: rail.network,
      tokenAddress: rail.tokenAddress as Address,
      paymentAddress: rail.paymentAddress as Address,
    })),
  }));
}
