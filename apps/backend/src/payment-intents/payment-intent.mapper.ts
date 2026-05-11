import { type Address } from 'viem';
import { PaymentIntentStatus } from './enums/payment-intent-status.enum';
import { paymentIntents } from './payment-intents.schema';
import { PaymentIntent } from './interfaces/payment-intent.interface';
import { PaymentIntentResponseDto } from './dto/payment-intent-response.dto';
import { Quote } from '../quotes/interfaces/quote.interface';
import { Token, TokenRail } from '../tokens/interfaces/token.interface';

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

  static toResponse(
    intent: PaymentIntent,
    quote: Quote,
    token: Token,
    rail: TokenRail,
  ): PaymentIntentResponseDto {
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
        id: quote.id,
        amount: quote.amount,
        currencyCode: quote.currencyCode,
        cryptoAmount: quote.cryptoAmount,
        rate: quote.rate,
        expiresAt: quote.expiresAt,
      },
      token: {
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        network: rail.network,
        tokenAddress: rail.tokenAddress,
        paymentAddress: rail.paymentAddress,
        chainId: rail.chainId,
        confirmations: rail.confirmations,
      },
    };
  }
}
