import { type CurrencyCode } from '../common/constants/supported-currencies.contant';
import { quotes } from './quotes.schema';
import { Quote } from './interfaces/quote.interface';

export class QuoteMapper {
  static toDomain(quote: typeof quotes.$inferSelect): Quote {
    return {
      id: quote.id,
      amount: quote.amount,
      currencyCode: quote.currencyCode as CurrencyCode,
      cardFee: quote.cardFee,
      cryptoAmount: quote.cryptoAmount,
      rate: quote.rate,
      tokenId: quote.tokenId,
      expiresAt: quote.expiresAt,
      consumedAt: quote.consumedAt,
      createdAt: quote.createdAt,
    };
  }
}
