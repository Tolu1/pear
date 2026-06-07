import { base } from 'viem/chains';
import type { Token } from '../../src/tokens/interfaces/token.interface';
import type { TokenRail } from '../../src/tokens/interfaces/token-rail.interface';
import { makeAddress } from './address.factory';

export function makeTokenRail(overrides: Partial<TokenRail> = {}): TokenRail {
  return {
    id: 'usdc-base',
    tokenId: 'usd-coin',
    chainId: base.id,
    network: 'base',
    tokenAddress: makeAddress(),
    paymentAddress: makeAddress(),
    confirmations: 2,
    ...overrides,
  };
}

export function makeToken(overrides: Partial<Token> = {}): Token {
  return {
    id: 'usd-coin',
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
    coingeckoId: 'usd-coin',
    rails: [makeTokenRail()],
    ...overrides,
  };
}
