import { Payment } from '../../payments/interfaces/payment.interface';
import { PaymentResult } from '../../payments/interfaces/payment-result.interface';

export interface PaymentAdapter {
  pay(payment: Payment, cookies: string[]): Promise<PaymentResult>;
  supports(domain: string): boolean;
}
