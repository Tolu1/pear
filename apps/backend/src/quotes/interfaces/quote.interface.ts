import { type CurrencyCode } from '../../common/constants/supported-currencies.contant';
import {
  type Blockchain,
  type TokenId,
} from '../../common/constants/supported-tokens.constant';

export interface Quote {
  id: string;
  amount: string;
  currency: CurrencyCode;
  cryptoAmount: string;
  rate: string;
  tokenId: TokenId;
  blockchain: Blockchain;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
}
