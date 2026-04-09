import { PaymentIntentStatus } from '../enums/payment-intent-status.enum';
import { PaymentIntent } from '../interfaces/payment-intent.interface';

export class PaymentIntentStatusResponseDto implements Pick<
  PaymentIntent,
  'id' | 'status'
> {
  id: string;
  status: PaymentIntentStatus;
}
