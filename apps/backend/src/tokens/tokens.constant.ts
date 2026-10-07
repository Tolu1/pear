import { base, baseSepolia, lisk } from 'viem/chains';
import { arc, arcTestnet } from '../blockchain/arc-chains.constant';
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
        id: 'usdc-base',
        tokenId: 'usd-coin',
        chainId: base.id,
        network: 'base',
        tokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        paymentAddress: '0xB7cb8f81664EbFC88EB855cF939Bb8b05bC216Cc',
        confirmations: 2,
      },
      {
        id: 'usdc-base-sepolia',
        tokenId: 'usd-coin',
        chainId: baseSepolia.id,
        network: 'baseSepolia',
        tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
        paymentAddress: '0xB7cb8f81664EbFC88EB855cF939Bb8b05bC216Cc',
        confirmations: 1,
      },
      {
        id: 'usdc-lisk',
        tokenId: 'usd-coin',
        chainId: lisk.id,
        network: 'lisk',
        tokenAddress: '0xf242275d3a6527d877f2c927a82d9b057609cc71',
        paymentAddress: '0xcb5C728921d1B03DF761E56F8CBB7fde71460069',
        confirmations: 2,
      },
      {
        id: 'usdc-arc',
        tokenId: 'usd-coin',
        chainId: arc.id,
        network: 'arc',
        tokenAddress: '0x3600000000000000000000000000000000000000',
        paymentAddress: '0x7DaB556963888254090B4C50378A6E208986842F',
        confirmations: 1,
      },
      {
        id: 'usdc-arc-testnet',
        tokenId: 'usd-coin',
        chainId: arcTestnet.id,
        network: 'arcTestnet',
        tokenAddress: '0x3600000000000000000000000000000000000000',
        paymentAddress: '0x7DaB556963888254090B4C50378A6E208986842F',
        confirmations: 1,
      },
    ],
  },
];
