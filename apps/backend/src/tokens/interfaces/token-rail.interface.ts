import { type Address } from 'viem';

export interface TokenRail {
  network: string;
  chainId: number;
  tokenAddress: Address;
  paymentAddress: Address;
  confirmations: number;
}
