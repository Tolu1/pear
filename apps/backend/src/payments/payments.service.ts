import { Injectable, MessageEvent } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { DatabaseService } from '../database/database.service';
import { payments } from '../database/database.schema';
import { PaymentsEventsService } from './payments-events.service';
import { type PaymentStatus } from '../database/database.types';
import { Observable } from 'rxjs';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';

@Injectable()
export class PaymentsService {
  constructor(
    private databaseService: DatabaseService,
    private readonly paymentsEventsService: PaymentsEventsService,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  async create(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const id = uuidv4();

    const tokenAmount = await this.exchangeRateService.convert(
      createPaymentDto.amount,
      createPaymentDto.currencyCode,
      createPaymentDto.tokenId,
    );

    const [payment] = await this.databaseService.db
      .insert(payments)
      .values({
        id,
        domain: createPaymentDto.domain,
        paymentUrl: createPaymentDto.paymentUrl,
        amount: createPaymentDto.amount,
        currencyCode: createPaymentDto.currencyCode,
        tokenId: createPaymentDto.tokenId,
        tokenAmount: tokenAmount,
        from: createPaymentDto.from,
        status: 'created',
      })
      .returning();

    this.mockPaymentFlow(id);

    return payment;
  }

  async findOne(id: string): Promise<PaymentResponseDto> {
    const [payment] = await this.databaseService.db
      .select()
      .from(payments)
      .where(eq(payments.id, id));

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  }

  subscribeToPaymentEvents(id: string): Observable<MessageEvent> {
    return this.paymentsEventsService.subscribeToPaymentEvents(id);
  }

  private mockPaymentFlow(id: string): void {
    setTimeout(async () => {
      await this.updateStatus(id, 'awaiting_crypto_payment');

      setTimeout(async () => {
        await this.updateStatus(id, 'processing_fiat_payment');

        setTimeout(async () => {
          await this.updateStatus(id, 'completed');
        }, 3000);
      }, 5000);
    }, 2000);
  }

  private async updateStatus(id: string, status: PaymentStatus): Promise<void> {
    const [payment] = await this.databaseService.db
      .update(payments)
      .set({ status, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();

    this.paymentsEventsService.sendEvent({
      data: {
        paymentId: payment.id,
        status: payment.status,
      },
    });
  }
}
