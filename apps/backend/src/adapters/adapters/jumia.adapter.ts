import { PaymentAdapter } from '../interfaces/payment-adapter.interface';
import { Payment } from '../../payments/interfaces/payment.interface';
import { PaymentResult } from '../../payments/interfaces/payment-result.interface';

export class JumiaAdapter implements PaymentAdapter {
  private readonly SUPPORTED_DOMAINS = ['jumia.com', 'jumia.co'];

  supports(domain: string): boolean {
    return this.SUPPORTED_DOMAINS.some((supported) =>
      domain.includes(supported),
    );
  }

  async pay(payment: Payment, cookies: string[]): Promise<PaymentResult> {
    return {
      success: true,
    };
  }
}
