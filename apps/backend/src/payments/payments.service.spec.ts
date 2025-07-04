import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { DatabaseService } from '../database/database.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';
import { PaymentsEventsService } from './payments-events.service';
import { v4 as uuidv4 } from 'uuid';
import { Observable } from 'rxjs';

jest.mock('uuid');

describe('PaymentsService', () => {
  let service: PaymentsService;

  const mockReturningValue = [
    {
      id: 'mock-id',
      merchantDomain: 'example.com',
      paymentUrl: 'https://example.com/payment',
      from: '0x1234567890123456789012345678901234567890',
      fiatAmount: '100.00',
      fiatCurrencyCode: 'ngn',
      tokenId: 'usd-coin',
      tokenAmount: '50.00',
      blockchain: 'lisk',
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockDatabaseService = {
    db: {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue(mockReturningValue),
    },
  };

  const mockExchangeRateService = {
    convert: jest.fn().mockResolvedValue('50.00'),
    getRate: jest.fn().mockResolvedValue('0.50'),
  };

  const mockPaymentsEventsService = {
    sendEvent: jest.fn(),
    subscribeToPaymentEvents: jest.fn().mockReturnValue(new Observable()),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (uuidv4 as jest.Mock).mockReturnValue('mock-id');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        DatabaseService,
        ExchangeRateService,
        PaymentsEventsService,
      ],
    })
      .overrideProvider(DatabaseService)
      .useValue(mockDatabaseService)
      .overrideProvider(ExchangeRateService)
      .useValue(mockExchangeRateService)
      .overrideProvider(PaymentsEventsService)
      .useValue(mockPaymentsEventsService)
      .compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a payment', async () => {
    const createPaymentDto = {
      merchantDomain: 'example.com',
      paymentUrl: 'https://example.com/payment',
      from: '0x1234567890123456789012345678901234567890',
      fiatAmount: '100.00',
      fiatCurrencyCode: 'ngn',
      tokenId: 'usd-coin',
      blockchain: 'lisk',
      cookies: ['cookie1=value1', 'cookie2=value2'],
    } satisfies CreatePaymentDto;
    const payment = await service.create(createPaymentDto);
    const expectedPayment = mockReturningValue[0];

    expect(payment).toEqual(expectedPayment);
  });

  it('should trigger mock payment flow', async () => {
    const createPaymentDto = {
      merchantDomain: 'example.com',
      paymentUrl: 'https://example.com/payment',
      from: '0x1234567890123456789012345678901234567890',
      fiatAmount: '100.00',
      fiatCurrencyCode: 'ngn',
      tokenId: 'usd-coin',
      blockchain: 'lisk',
      cookies: ['cookie1=value1', 'cookie2=value2'],
    } satisfies CreatePaymentDto;

    const mockPaymentFlowSpy = jest.spyOn(service as any, 'mockPaymentFlow');
    await service.create(createPaymentDto);

    expect(mockPaymentFlowSpy).toHaveBeenCalledWith('mock-id');
  });

  it('should find a payment', async () => {
    mockDatabaseService.db.where.mockImplementationOnce(() =>
      Promise.resolve(mockReturningValue),
    );
    const id = 'mock-id';
    const payment = await service.findOne(id);
    const expectedPayment = mockReturningValue[0];
    expect(payment).toEqual(expectedPayment);
  });

  it('should simulate a payment flow', async () => {
    const createPaymentDto = {
      merchantDomain: 'example.com',
      paymentUrl: 'https://example.com/payment',
      from: '0x1234567890123456789012345678901234567890',
      fiatAmount: '100.00',
      fiatCurrencyCode: 'ngn',
      tokenId: 'usd-coin',
      blockchain: 'lisk',
      cookies: ['cookie1=value1', 'cookie2=value2'],
    } satisfies CreatePaymentDto;
    const updateStatusSpy = jest.spyOn(service as any, 'updateStatus');
    await service.create(createPaymentDto);

    await jest.runAllTimersAsync();
    expect(updateStatusSpy).toHaveBeenCalledTimes(3);
    expect(updateStatusSpy).toHaveBeenNthCalledWith(
      1,
      'mock-id',
      'awaiting_crypto_payment',
    );
    expect(updateStatusSpy).toHaveBeenNthCalledWith(
      2,
      'mock-id',
      'processing_fiat_payment',
    );
    expect(updateStatusSpy).toHaveBeenNthCalledWith(3, 'mock-id', 'completed');
    expect(mockPaymentsEventsService.sendEvent).toHaveBeenCalledTimes(3);
  });

  it('should subscribe to payment events', () => {
    const id = 'mock-id';
    const observable = service.subscribeToPaymentEvents(id);
    expect(
      mockPaymentsEventsService.subscribeToPaymentEvents,
    ).toHaveBeenCalledWith(id);
    expect(observable).toBeInstanceOf(Observable);
  });
});
