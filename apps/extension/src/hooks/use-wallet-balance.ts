import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { getWalletBalance } from "@/core/wallet/get-wallet-balance";
import { walletBalanceKeys } from "@/lib/query-keys";

export function useWalletBalance() {
  const { address, chainId } = useAccount();
  return useQuery({
    queryKey: walletBalanceKeys.of(address, chainId),
    queryFn: () => getWalletBalance(address, chainId),
    placeholderData: keepPreviousData,
  });
}
