import { UserRejectedRequestError } from "viem";
import { switchNetwork } from "@/lib/blockchain/switch-network";
import type { paymentChains } from "@/lib/blockchain/config";

type PaymentChainId = (typeof paymentChains)[number]["id"];

export async function switchWalletNetwork(
  chainId: PaymentChainId,
): Promise<void> {
  try {
    await switchNetwork(chainId);
  } catch (error) {
    if (error instanceof UserRejectedRequestError) return;
    throw error;
  }
}
