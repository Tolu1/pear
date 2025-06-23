import 'dotenv/config';

export const SUPPORTED_TOKENS = {
  lisk: {
    'usd-coin': {
      name: 'USDC',
      symbol: 'USDC',
      coingeckoId: 'usd-coin',
      contractAddress: '0x...',
      paymentAddress: process.env.PAYMENT_ADDRESS_USD_COIN!,
    },
    lisk: {
      name: 'Lisk',
      symbol: 'LSK',
      coingeckoId: 'lisk',
      contractAddress: '0x...',
      paymentAddress: process.env.PAYMENT_ADDRESS_LISK!,
    },
  },
  liskSepolia: {
    'usd-coin': {
      name: 'USDC',
      symbol: 'USDC',
      coingeckoId: 'usd-coin',
      contractAddress: '0x...',
      paymentAddress: process.env.PAYMENT_ADDRESS_USD_COIN!,
    },
    lisk: {
      name: 'Lisk',
      symbol: 'LSK',
      coingeckoId: 'lisk',
      contractAddress: '0x...',
      paymentAddress: process.env.PAYMENT_ADDRESS_LISK!,
    },
  },
} as const;

export type Blockchain = keyof typeof SUPPORTED_TOKENS;
export type TokenId = {
  [K in keyof typeof SUPPORTED_TOKENS]: keyof (typeof SUPPORTED_TOKENS)[K];
}[keyof typeof SUPPORTED_TOKENS];

export const SUPPORTED_BLOCKCHAINS = Object.keys(
  SUPPORTED_TOKENS,
) as Blockchain[];

export const SUPPORTED_TOKEN_IDS = Object.values(SUPPORTED_TOKENS).flatMap(
  (blockchain) => Object.keys(blockchain),
) as TokenId[];
