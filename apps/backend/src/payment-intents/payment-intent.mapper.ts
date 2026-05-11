import { type Address } from 'viem';
import { PaymentIntentStatus } from './enums/payment-intent-status.enum';
import { paymentIntents } from './payment-intents.schema';
import { PaymentIntent } from './interfaces/payment-intent.interface';
import { PaymentIntentResponseDto } from './dto/payment-intent-response.dto';
import { Quote } from '../quotes/interfaces/quote.interface';
import { TokenRail } from '../tokens/interfaces/token-rail.interface';

export class PaymentIntentMapper {
  static toDomain(
    intentRow: typeof paymentIntents.$inferSelect,
    quote: Quote,
    rail: TokenRail,
  ): PaymentIntent {
    return {
      id: intentRow.id,
      status: intentRow.status as PaymentIntentStatus,
      fromAddress: intentRow.fromAddress as Address,
      merchantDomain: intentRow.merchantDomain,
      metadata: intentRow.metadata as Record<string, unknown> | null,
      txHash: intentRow.txHash,
      expiresAt: intentRow.expiresAt,
      createdAt: intentRow.createdAt,
      updatedAt: intentRow.updatedAt,
      quote,
      rail,
    };
  }

  static toResponse(intent: PaymentIntent): PaymentIntentResponseDto {
    return {
      id: intent.id,
      status: intent.status,
      fromAddress: intent.fromAddress,
      merchantDomain: intent.merchantDomain,
      metadata: intent.metadata,
      txHash: intent.txHash,
      expiresAt: intent.expiresAt,
      createdAt: intent.createdAt,
      updatedAt: intent.updatedAt,
      quote: {
        id: intent.quote.id,
        amount: intent.quote.amount,
        currencyCode: intent.quote.currencyCode,
        cryptoAmount: intent.quote.cryptoAmount,
        rate: intent.quote.rate,
        tokenId: intent.quote.tokenId,
        expiresAt: intent.quote.expiresAt,
      },
      rail: {
        id: intent.rail.id,
        tokenId: intent.rail.tokenId,
        chainId: intent.rail.chainId,
        network: intent.rail.network,
        tokenAddress: intent.rail.tokenAddress,
        paymentAddress: intent.rail.paymentAddress,
      },
    };
  }
}
