import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsEventsService } from './payments-events.service';
import { take } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

describe('PaymentsEventsService', () => {
  let service: PaymentsEventsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentsEventsService],
    }).compile();

    service = module.get<PaymentsEventsService>(PaymentsEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send events to subscribers', async () => {
    const receivedEvents: any[] = [];
    const subscription = service
      .subscribeToPaymentEvents('payment-123')
      .pipe(take(2))
      .subscribe((event) => {
        receivedEvents.push(event);
      });

    service.sendEvent({
      data: {
        paymentId: 'payment-123',
        status: 'awaiting_crypto_payment',
      },
    });

    service.sendEvent({
      data: {
        paymentId: 'payment-123',
        status: 'processing_fiat_payment',
      },
    });

    service.sendEvent({
      data: {
        paymentId: 'different-payment',
        status: 'completed',
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    subscription.unsubscribe();

    expect(receivedEvents.length).toBe(2);
    expect(receivedEvents[0]).toEqual({ data: 'awaiting_crypto_payment' });
    expect(receivedEvents[1]).toEqual({ data: 'processing_fiat_payment' });
  });

  it('should filter events by payment ID', async () => {
    const observable = service.subscribeToPaymentEvents('payment-abc');

    const promise = firstValueFrom(observable.pipe(take(1)));

    service.sendEvent({
      data: {
        paymentId: 'wrong-id',
        status: 'completed',
      },
    });

    service.sendEvent({
      data: {
        paymentId: 'payment-abc',
        status: 'processing_fiat_payment',
      },
    });

    const result = await promise;
    expect(result).toEqual({ data: 'processing_fiat_payment' });
  });

  it('should map event data to MessageEvent format', async () => {
    const promise = firstValueFrom(
      service.subscribeToPaymentEvents('test-id').pipe(take(1)),
    );

    service.sendEvent({
      data: {
        paymentId: 'test-id',
        status: 'completed',
      },
    });

    const result = await promise;
    expect(result).toEqual({ data: 'completed' });
  });
});
