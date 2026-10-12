import type { Address } from "viem";

export interface Rail {
  id: string;
  chainId: number;
  network: string;
  tokenAddress: Address;
  paymentAddress: Address;
}
