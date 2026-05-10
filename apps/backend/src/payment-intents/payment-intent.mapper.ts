import { type Address } from 'viem';
import { PaymentIntentStatus } from './enums/payment-intent-status.enum';
import { paymentIntents } from './payment-intents.schema';
import { PaymentIntent } from './interfaces/payment-intent.interface';

export class PaymentIntentMapper {
  static toDomain(intent: typeof paymentIntents.$inferSelect): PaymentIntent {
    return {
      id: intent.id,
      quoteId: intent.quoteId,
      status: intent.status as PaymentIntentStatus,
      fromAddress: intent.fromAddress as Address,
      merchantDomain: intent.merchantDomain,
      metadata: intent.metadata as Record<string, unknown> | null,
      txHash: intent.txHash,
      expiresAt: intent.expiresAt,
      createdAt: intent.createdAt,
      updatedAt: intent.updatedAt,
    };
  }
}
