import { type Address } from 'viem';
import { Token } from '../interfaces/token.interface';
import { TokenRail } from '../interfaces/token-rail.interface';

export class TokenResponseDto implements Omit<Token, 'rails'> {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  coingeckoId: string;
  rails: TokenRailResponseDto[];
}

export class TokenRailResponseDto implements Omit<TokenRail, 'confirmations'> {
  network: string;
  chainId: number;
  tokenAddress: Address;
  paymentAddress: Address;
}
