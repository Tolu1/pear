import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  encodeEventTopics,
  erc20Abi,
  parseUnits,
  type Hash,
  type Log,
  type TransactionReceipt,
} from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { BlockchainService } from './blockchain.service';
import { TransferFailedException } from './exceptions/transfer-failed.exception';
import { TransferMismatchException } from './exceptions/transfer-mismatch.exception';
import { UnsupportedChainException } from './exceptions/unsupported-chain.exception';
import { createMock, DeepMocked } from '../../test/utils/create-mock';
import { makeAddress, makeTxHash } from '../../test/factories';

const waitForTransactionReceipt = jest.fn();

jest.mock('viem', () => {
  const actual = jest.requireActual<typeof import('viem')>('viem');
  return {
    ...actual,
    createPublicClient: jest.fn(() => ({ waitForTransactionReceipt })),
  };
});

const buildTransferLog = (args: {
  tokenAddress: `0x${string}`;
  from: `0x${string}`;
  to: `0x${string}`;
  value: bigint;
}): Log => {
  const topics = encodeEventTopics({
    abi: erc20Abi,
    eventName: 'Transfer',
    args: { from: args.from, to: args.to },
  });
  const valueHex = `0x${args.value.toString(16).padStart(64, '0')}`;
  return {
    address: args.tokenAddress,
    topics: topics as [`0x${string}`, ...`0x${string}`[]],
    data: valueHex,
    blockHash: '0x0',
    blockNumber: 1n,
    logIndex: 0,
    transactionHash: '0x0',
    transactionIndex: 0,
    removed: false,
  } as unknown as Log;
};

describe('BlockchainService', () => {
  let service: BlockchainService;
  let configService: DeepMocked<ConfigService>;

  const fromAddress = makeAddress();
  const toAddress = makeAddress();
  const tokenAddress = makeAddress();
  const txHash: Hash = makeTxHash();

  beforeEach(async () => {
    waitForTransactionReceipt.mockReset();
    configService = createMock<ConfigService>();
    configService.get.mockReturnValue(undefined);

    const moduleRef = await Test.createTestingModule({
      providers: [
        BlockchainService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = moduleRef.get(BlockchainService);
  });

  describe('assertTransfer()', () => {
    const expected = (overrides: Partial<{ value: bigint }> = {}) => ({
      from: fromAddress,
      to: toAddress,
      tokenAddress,
      value: parseUnits('10', 6),
      chainId: base.id,
      ...overrides,
    });

    it('returns the receipt when a matching ERC-20 Transfer log is present', async () => {
      const log = buildTransferLog({
        tokenAddress,
        from: fromAddress,
        to: toAddress,
        value: parseUnits('10', 6),
      });
      const receipt = { status: 'success', logs: [log] } as TransactionReceipt;
      waitForTransactionReceipt.mockResolvedValue(receipt);

      const result = await service.assertTransfer(txHash, expected(), 2);

      expect(result).toBe(receipt);
      expect(waitForTransactionReceipt).toHaveBeenCalledWith({
        hash: txHash,
        confirmations: 2,
      });
    });

    it('throws TransferFailedException when the receipt status is not success', async () => {
      waitForTransactionReceipt.mockResolvedValue({
        status: 'reverted',
        logs: [],
      } as unknown as TransactionReceipt);

      await expect(
        service.assertTransfer(txHash, expected(), 1),
      ).rejects.toThrow(TransferFailedException);
    });

    it('throws TransferMismatchException when no Transfer log matches the expected transfer', async () => {
      const log = buildTransferLog({
        tokenAddress,
        from: fromAddress,
        to: toAddress,
        value: parseUnits('1', 6),
      });
      waitForTransactionReceipt.mockResolvedValue({
        status: 'success',
        logs: [log],
      } as unknown as TransactionReceipt);

      await expect(
        service.assertTransfer(
          txHash,
          expected({ value: parseUnits('10', 6) }),
          1,
        ),
      ).rejects.toThrow(TransferMismatchException);
    });

    it('throws UnsupportedChainException for an unsupported chain id', async () => {
      await expect(
        service.assertTransfer(txHash, { ...expected(), chainId: 9999 }, 1),
      ).rejects.toThrow(UnsupportedChainException);
      expect(waitForTransactionReceipt).not.toHaveBeenCalled();
    });

    it('caches the public client per chain so repeated calls reuse it', async () => {
      const log = buildTransferLog({
        tokenAddress,
        from: fromAddress,
        to: toAddress,
        value: parseUnits('10', 6),
      });
      waitForTransactionReceipt.mockResolvedValue({
        status: 'success',
        logs: [log],
      } as unknown as TransactionReceipt);

      await service.assertTransfer(txHash, expected(), 1);
      await service.assertTransfer(
        txHash,
        { ...expected(), chainId: baseSepolia.id },
        1,
      );
      await service.assertTransfer(txHash, expected(), 1);

      const { createPublicClient } =
        jest.requireMock<typeof import('viem')>('viem');
      // Two unique chains => two client constructions, even with three calls.
      expect(createPublicClient).toHaveBeenCalledTimes(2);
    });
  });
});
