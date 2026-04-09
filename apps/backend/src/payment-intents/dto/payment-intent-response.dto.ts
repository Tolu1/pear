import { PaymentIntentStatus } from '../enums/payment-intent-status.enum';
import { PaymentIntent } from '../interfaces/payment-intent.interface';

export class PaymentIntentResponseDto implements PaymentIntent {
  id: string;
  quoteId: string;
  status: PaymentIntentStatus;
  amount: string;
  currency: string;
  cryptoAmount: string;
  tokenId: string;
  blockchain: string;
  contractAddress: string;
  paymentAddress: string;
  fromAddress: string;
  merchantDomain: string;
  metadata: Record<string, unknown> | null;
  expiresAt: Date;
  createdAt: Date;
}
