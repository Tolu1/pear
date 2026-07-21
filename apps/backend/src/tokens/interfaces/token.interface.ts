import { TokenRail } from './token-rail.interface';

export interface Token {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  coingeckoId: string;
  rails: TokenRail[];
}
