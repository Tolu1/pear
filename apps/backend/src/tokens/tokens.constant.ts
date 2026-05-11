import { base, baseSepolia, lisk } from 'viem/chains';
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
        paymentAddress: '0xB7cb8f81664EbFC88EB855cF939Bb8b05bC216Cc',
        confirmations: 2,
      },
      {
        network: 'baseSepolia',
        chainId: baseSepolia.id,
        tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
        paymentAddress: '0xB7cb8f81664EbFC88EB855cF939Bb8b05bC216Cc',
        confirmations: 1,
      },
      {
        network: 'lisk',
        chainId: lisk.id,
        tokenAddress: '0xf242275d3a6527d877f2c927a82d9b057609cc71',
        paymentAddress: '0xcb5C728921d1B03DF761E56F8CBB7fde71460069',
        confirmations: 2,
      },
    ],
  },
];
