import { type CurrencyCode } from '../../common/constants/supported-currencies.contant';

export interface Quote {
  id: string;
  amount: string;
  currency: CurrencyCode;
  cryptoAmount: string;
  rate: string;
  tokenId: string;
  network: string;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
}
