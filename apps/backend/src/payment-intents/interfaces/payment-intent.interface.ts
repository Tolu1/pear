import { type Address } from 'viem';
import { PaymentIntentStatus } from '../enums/payment-intent-status.enum';

export interface PaymentIntent {
  id: string;
  quoteId: string;
  status: PaymentIntentStatus;
  fromAddress: Address;
  merchantDomain: string;
  metadata: Record<string, unknown> | null;
  txHash: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
