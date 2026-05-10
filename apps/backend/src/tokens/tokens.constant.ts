import { base, baseSepolia, lisk, type Chain } from 'viem/chains';
import { type Address } from 'viem';

interface TokenNetworkConfig {
  network: string;
  tokenAddress: Address;
  paymentAddress: Address;
  chain: Chain;
  confirmations: number;
}

interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  networks: TokenNetworkConfig[];
}

export const tokens: Record<string, TokenConfig> = {
  'usd-coin': {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
    networks: [
      {
        network: 'base',
        tokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        paymentAddress: process.env.PAYMENT_ADDRESS_SAFE! as Address,
        chain: base,
        confirmations: 2,
      },
      {
        network: 'baseSepolia',
        tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
        paymentAddress: process.env.PAYMENT_ADDRESS_SAFE! as Address,
        chain: baseSepolia,
        confirmations: 1,
      },
      {
        network: 'lisk',
        tokenAddress: '0xf242275d3a6527d877f2c927a82d9b057609cc71',
        paymentAddress: process.env.PAYMENT_ADDRESS_LISK! as Address,
        chain: lisk,
        confirmations: 2,
      },
    ],
  },
};
