import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of } from 'rxjs';

describe('PaymentsController', () => {
  let controller: PaymentsController;

  const mockPayment = {
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
  };

  const createPaymentDto = {
    merchantDomain: 'example.com',
    paymentUrl: 'https://example.com/payment',
    from: '0x1234567890123456789012345678901234567890',
    fiatAmount: '100.00',
    fiatCurrencyCode: 'ngn',
    tokenId: 'usd-coin',
    blockchain: 'lisk',
  } satisfies CreatePaymentDto;

  const mockPaymentsService = {
    create: jest.fn().mockResolvedValue(mockPayment),
    findOne: jest.fn().mockResolvedValue(mockPayment),
    subscribeToPaymentEvents: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [PaymentsService],
    })
      .overrideProvider(PaymentsService)
      .useValue(mockPaymentsService)
      .compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a payment', async () => {
    const result = await controller.create(createPaymentDto);
    expect(result).toEqual(mockPayment);
  });

  it('should throw HttpException on create failure', async () => {
    mockPaymentsService.create.mockRejectedValueOnce(
      new Error('Payment service error'),
    );
    await expect(controller.create(createPaymentDto)).rejects.toThrow(
      new HttpException(
        'Failed to create payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      ),
    );
  });

  it('should find a payment', async () => {
    const result = await controller.findOne('mock-id');
    expect(result).toEqual(mockPayment);
  });

  it('should throw HttpException if payment not found', async () => {
    mockPaymentsService.findOne.mockRejectedValueOnce(new Error('Not found'));
    await expect(controller.findOne('mock-id')).rejects.toThrow(
      new HttpException('Payment not found', HttpStatus.NOT_FOUND),
    );
  });

  it('should subscribe to payment events', () => {
    const mockObservable = of({ data: mockPayment });
    mockPaymentsService.subscribeToPaymentEvents.mockReturnValue(
      mockObservable,
    );

    const result = controller.subscribeToPaymentEvents('mock-id');

    expect(result).toBe(mockObservable);
  });
});
