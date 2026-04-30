import 'dotenv/config';

export type Blockchain = 'lisk' | 'base' | 'baseSepolia';
export type TokenId = 'usd-coin';

export type NetworkConfig = {
  contractAddress: `0x${string}`;
  paymentAddress: `0x${string}`;
};

type TokenConfig = {
  name: string;
  symbol: string;
  networks: Partial<Record<Blockchain, NetworkConfig>>;
};

export const SUPPORTED_TOKENS: Record<TokenId, TokenConfig> = {
  'usd-coin': {
    name: 'USDC',
    symbol: 'USDC',
    networks: {
      lisk: {
        contractAddress: '0xf242275d3a6527d877f2c927a82d9b057609cc71',
        paymentAddress: process.env.PAYMENT_ADDRESS_LISK! as `0x${string}`,
      },
      base: {
        contractAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        paymentAddress: process.env.PAYMENT_ADDRESS_SAFE! as `0x${string}`,
      },
      baseSepolia: {
        contractAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
        paymentAddress: process.env.PAYMENT_ADDRESS_SAFE! as `0x${string}`,
      },
    },
  },
};

export function getTokenNetworkConfig(
  tokenId: TokenId,
  blockchain: Blockchain,
): NetworkConfig | undefined {
  return SUPPORTED_TOKENS[tokenId].networks[blockchain];
}

export const SUPPORTED_TOKEN_IDS: TokenId[] = Object.keys(
  SUPPORTED_TOKENS,
) as TokenId[];

export const SUPPORTED_BLOCKCHAINS: Blockchain[] = [
  ...new Set(
    Object.values(SUPPORTED_TOKENS).flatMap(
      (token) => Object.keys(token.networks) as Blockchain[],
    ),
  ),
];
