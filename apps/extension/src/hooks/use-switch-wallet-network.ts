import { useMutation } from "@tanstack/react-query";
import { switchWalletNetwork } from "@/core/wallet/switch-wallet-network";

export function useSwitchWalletNetwork() {
  return useMutation({ mutationFn: switchWalletNetwork, throwOnError: false });
}
