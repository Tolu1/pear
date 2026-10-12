import { type Address } from 'viem';
import { PaymentIntentStatus } from '../enums/payment-intent-status.enum';
import { Quote } from '../../quotes/interfaces/quote.interface';
import { TokenRail } from '../../tokens/interfaces/token-rail.interface';

export interface PaymentIntent {
  id: string;
  status: PaymentIntentStatus;
  fromAddress: Address;
  merchantDomain: string;
  metadata: Record<string, unknown> | null;
  txHash: string | null;
  cardId: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  quote: Quote;
  rail: TokenRail;
}
