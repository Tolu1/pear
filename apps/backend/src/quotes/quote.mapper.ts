import { quotes } from './quotes.schema';
import { Quote } from './interfaces/quote.interface';

export class QuoteMapper {
  static toDomain(quote: typeof quotes.$inferSelect): Quote {
    return {
      id: quote.id,
      amount: quote.amount,
      currency: quote.currency,
      cryptoAmount: quote.cryptoAmount,
      tokenId: quote.tokenId,
      blockchain: quote.blockchain,
      expiresAt: quote.expiresAt,
      createdAt: quote.createdAt,
    };
  }
}
