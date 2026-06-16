import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type VirtualCard } from './interfaces/virtual-card.interface';
import { VirtualCardUnavailableException } from './exceptions/virtual-card-unavailable.exception';
import { PaymentCompletionFailedException } from './exceptions/payment-completion-failed.exception';

@Injectable()
export class PaymentIntentsService {
  constructor(private readonly configService: ConfigService) {}

  async getVirtualCard(intentId: string): Promise<VirtualCard> {
    const res = await fetch(this.buildUrl(intentId, 'card'));
    if (!res.ok) {
      throw new VirtualCardUnavailableException(intentId);
    }
    return (await res.json()) as VirtualCard;
  }

  async completePayment(intentId: string): Promise<void> {
    const res = await fetch(this.buildUrl(intentId, 'complete'), {
      method: 'POST',
      headers: {
        'x-service-api-key':
          this.configService.getOrThrow<string>('SERVICE_API_KEY'),
      },
    });
    if (!res.ok) {
      throw new PaymentCompletionFailedException(intentId, res.status);
    }
  }

  private buildUrl(intentId: string, action: string): string {
    const baseUrl = this.configService.getOrThrow<string>('BACKEND_URL');
    return `${baseUrl}/payment-intents/${intentId}/${action}`;
  }
}
