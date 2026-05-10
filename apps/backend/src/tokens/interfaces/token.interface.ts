import { type Address, type Chain } from 'viem';

export interface TokenNetwork {
  tokenAddress: Address;
  paymentAddress: Address;
  chain: Chain;
  confirmations: number;
}

export interface Token {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  coingeckoId: string;
  networks: Record<string, TokenNetwork>;
}
