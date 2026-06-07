import { type Address } from 'viem';

export interface TokenRail {
  id: string;
  tokenId: string;
  chainId: number;
  network: string;
  tokenAddress: Address;
  paymentAddress: Address;
  confirmations: number;
}
