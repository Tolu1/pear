import { type Address } from 'viem';

export interface Token {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  coingeckoId: string;
  rails: TokenRail[];
}

export interface TokenRail {
  network: string;
  chainId: number;
  tokenAddress: Address;
  paymentAddress: Address;
  confirmations: number;
}
