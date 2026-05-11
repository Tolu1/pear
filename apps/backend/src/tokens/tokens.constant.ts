import { base, baseSepolia, lisk } from 'viem/chains';
import { type Address } from 'viem';
import { type Token } from './interfaces/token.interface';

export const tokens: Token[] = [
  {
    id: 'usd-coin',
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
    coingeckoId: 'usd-coin',
    rails: [
      {
        network: 'base',
        chainId: base.id,
        tokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        paymentAddress: process.env.PAYMENT_ADDRESS_SAFE! as Address,
        confirmations: 2,
      },
      {
        network: 'baseSepolia',
        chainId: baseSepolia.id,
        tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
        paymentAddress: process.env.PAYMENT_ADDRESS_SAFE! as Address,
        confirmations: 1,
      },
      {
        network: 'lisk',
        chainId: lisk.id,
        tokenAddress: '0xf242275d3a6527d877f2c927a82d9b057609cc71',
        paymentAddress: process.env.PAYMENT_ADDRESS_LISK! as Address,
        confirmations: 2,
      },
    ],
  },
];
