import { type CurrencyCode } from '../common/constants/supported-currencies.contant';
import { quotes } from './quotes.schema';
import { Quote } from './interfaces/quote.interface';

export class QuoteMapper {
  static toDomain(quote: typeof quotes.$inferSelect): Quote {
    return {
      id: quote.id,
      amount: quote.amount,
      currency: quote.currency as CurrencyCode,
      cryptoAmount: quote.cryptoAmount,
      rate: quote.rate,
      tokenId: quote.tokenId,
      network: quote.network,
      expiresAt: quote.expiresAt,
      consumedAt: quote.consumedAt,
      createdAt: quote.createdAt,
    };
  }
}
