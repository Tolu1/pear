import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { Payment } from 'src/payments/interfaces/payment.interface';
import { SUPPORTED_TOKENS } from '../common/constants/supported-tokens.constant';

jest.mock('viem', () => ({
  createPublicClient: jest.fn(),
  http: jest.fn(),
  parseAbiItem: jest.fn(),
  decodeFunctionData: jest.fn(),
  // parseAbiItem: jest.fn(() => ({
  //   name: 'transfer',
  //   type: 'function',
  //   inputs: [
  //     { name: 'to', type: 'address' },
  //     { name: 'amount', type: 'uint256' },
  //   ],
  // })),
}));

jest.mock('viem/chains', () => ({
  lisk: { network: 'lisk' },
  liskSepolia: { network: 'liskSepolia' },
}));

jest.mock('viem/op-stack', () => ({
  publicActionsL2: jest.fn(() => ({})),
}));

describe('BlockchainService', () => {
  let service: BlockchainService;
  let mockPublicClient: any;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-moralis-api-key'),
  };

  const mockPayment = {
    id: 'test-payment-id',
    merchantDomain: 'example.com',
    paymentUrl: 'https://example.com/checkout',
    from: '0x1234567890123456789012345678901234567890',
    fiatAmount: '100.00',
    fiatCurrencyCode: 'usd',
    tokenAmount: '100.00',
    tokenId: 'usd-coin',
    blockchain: 'lisk',
    status: 'created',
  } satisfies Payment;

  const paymentAddress =
    SUPPORTED_TOKENS[mockPayment.blockchain][mockPayment.tokenId]
      .paymentAddress;

  beforeEach(async () => {
    mockPublicClient = {
      watchBlocks: jest.fn(),
      getTransaction: jest.fn(),
      extend: jest.fn().mockReturnThis(),
    };

    const { createPublicClient } = require('viem');
    createPublicClient.mockReturnValue(mockPublicClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockchainService, ConfigService],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    service = module.get<BlockchainService>(BlockchainService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should resolve when native payment is detected', async () => {
    const mockTransaction = {
      hash: '0xabcd',
      from: '0x1111',
      to: paymentAddress,
      value: BigInt('1000000000000000000'),
    };

    const mockBlock = {
      number: BigInt('12345'),
      transactions: ['0xabcd'],
    };

    mockPublicClient.watchBlocks.mockImplementation(({ onBlock }) => {
      setTimeout(() => onBlock(mockBlock), 0);
      return jest.fn();
    });

    mockPublicClient.getTransaction.mockResolvedValue(mockTransaction);

    const result = await service.watchForPayment({ payment: mockPayment });

    expect(result).toEqual({
      hash: '0xabcd',
      from: '0x1111',
      to: paymentAddress,
      amount: '1000000000000000000',
      tokenType: 'native',
    });
  });

  it('should resolve when ERC-20 payment is detected', async () => {
    const { decodeFunctionData } = require('viem');
    decodeFunctionData.mockReturnValue({
      args: [paymentAddress, BigInt('500000000')],
    });

    const mockTransaction = {
      hash: '0xefgh',
      from: '0x2222',
      to: '0xTokenContract',
      input: `0xa9059cbb000000000000000000000000${paymentAddress.slice(2)}000000000000000000000000000000000000000000000000000000001dcd6500`,
      value: BigInt('0'),
    };

    const mockBlock = {
      number: BigInt('12346'),
      transactions: ['0xefgh'],
    };

    mockPublicClient.watchBlocks.mockImplementation(({ onBlock }) => {
      setTimeout(() => onBlock(mockBlock), 0);
      return jest.fn();
    });

    mockPublicClient.getTransaction.mockResolvedValue(mockTransaction);

    const result = await service.watchForPayment({ payment: mockPayment });

    expect(result).toEqual({
      hash: '0xefgh',
      from: '0x2222',
      to: paymentAddress,
      amount: '500000000',
      tokenType: 'erc20',
      tokenContract: '0xTokenContract',
    });
  });

  it('should timeout after 15 minutes if no payment is received', async () => {
    jest.useFakeTimers();

    mockPublicClient.watchBlocks.mockImplementation(() => {
      return jest.fn();
    });

    const promise = service.watchForPayment({ payment: mockPayment });
    const TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
    jest.advanceTimersByTime(TIMEOUT);

    await expect(promise).rejects.toThrow(
      'Payment timeout: No payment received for test-payment-id after 15 minutes',
    );

    jest.useRealTimers();
  });

  it('should handle blockchain errors', async () => {
    const blockchainError = new Error('Blockchain connection failed');

    mockPublicClient.watchBlocks.mockImplementation(({ onError }) => {
      setTimeout(() => onError(blockchainError), 0);
      return jest.fn();
    });

    await expect(
      service.watchForPayment({ payment: mockPayment }),
    ).rejects.toThrow('Blockchain connection failed');
  });

  it('should handle RPC and network errors gracefully and continue watching', async () => {
    const mockBlock = {
      number: BigInt('12347'),
      transactions: ['0xhash1', '0xhash2', '0xhash3'],
    };

    mockPublicClient.watchBlocks.mockImplementation(({ onBlock }) => {
      setTimeout(() => onBlock(mockBlock), 0);
      return jest.fn();
    });

    mockPublicClient.getTransaction
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockRejectedValueOnce(new Error('Rate limit exceeded'))
      .mockResolvedValueOnce({
        hash: '0xhash3',
        from: '0x1111',
        to: paymentAddress,
        value: BigInt('1000000000000000000'),
      });

    const result = await service.watchForPayment({ payment: mockPayment });

    expect(result.hash).toBe('0xhash3');
    expect(mockPublicClient.getTransaction).toHaveBeenCalledTimes(3);
  });
});
