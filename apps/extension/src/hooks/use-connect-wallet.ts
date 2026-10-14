import { useMutation } from "@tanstack/react-query";
import { connectWallet } from "@/core/wallet/connect-wallet";

export function useConnectWallet() {
  return useMutation({ mutationFn: connectWallet, throwOnError: false });
}
