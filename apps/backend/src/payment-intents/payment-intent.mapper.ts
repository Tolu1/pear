import { PaymentIntentStatus } from './enums/payment-intent-status.enum';
import { paymentIntents } from './payment-intents.schema';
import { PaymentIntent } from './interfaces/payment-intent.interface';

export class PaymentIntentMapper {
  static toDomain(intent: typeof paymentIntents.$inferSelect): PaymentIntent {
    return {
      id: intent.id,
      quoteId: intent.quoteId,
      status: intent.status as PaymentIntentStatus,
      amount: intent.amount,
      currency: intent.currency,
      cryptoAmount: intent.cryptoAmount,
      tokenId: intent.tokenId,
      blockchain: intent.blockchain,
      paymentAddress: intent.paymentAddress,
      fromAddress: intent.fromAddress,
      merchantDomain: intent.merchantDomain,
      metadata: intent.metadata as Record<string, unknown> | null,
      expiresAt: intent.expiresAt,
      createdAt: intent.createdAt,
    };
  }
}
