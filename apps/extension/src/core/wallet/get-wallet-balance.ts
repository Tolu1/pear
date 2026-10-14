import type { Address } from "viem";
import { queryClient } from "@/lib/query-client";
import { supportedTokenKeys } from "@/lib/query-keys";
import { getSupportedTokens } from "@/lib/api/tokens/get-supported-tokens";
import { getTokenBalance } from "@/lib/blockchain/get-token-balance";
import type { WalletBalance } from "@/interfaces/wallet-balance";

const TOKEN_ID = "usd-coin";

// Null when Pear has no USDC rail on the wallet's network.
export async function getWalletBalance(
  address: Address | undefined,
  chainId: number | undefined,
): Promise<WalletBalance | null> {
  if (!address || !chainId) return null;

  const supportedTokens = await queryClient.fetchQuery({
    queryKey: supportedTokenKeys.all,
    queryFn: getSupportedTokens,
  });
  const token = supportedTokens.find((t) => t.id === TOKEN_ID);
  const rail = token?.rails.find((r) => r.chainId === chainId);
  if (!token || !rail) return null;

  const amount = await getTokenBalance(
    rail.tokenAddress,
    address,
    token.decimals,
  );
  return { symbol: token.symbol, amount };
}
