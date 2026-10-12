import { type CurrencyCode } from '../../common/constants/supported-currencies.contant';
import { Quote } from '../interfaces/quote.interface';

export class QuoteResponseDto implements Quote {
  id: string;
  amount: string;
  currencyCode: CurrencyCode;
  cardFee: string;
  cryptoAmount: string;
  rate: string;
  tokenId: string;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
}
