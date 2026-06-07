import { type CurrencyCode } from '../../common/constants/supported-currencies.contant';

export interface Quote {
  id: string;
  amount: string;
  currencyCode: CurrencyCode;
  cryptoAmount: string;
  rate: string;
  tokenId: string;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
}
