import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, createWalletClient } from 'viem';
import { generatePrivateKey } from 'viem/accounts';
import { CctpService } from './cctp.service';
import { BridgeFailedException } from './exceptions/bridge-failed.exception';
import { createMock, DeepMocked } from '../../test/utils/create-mock';

jest.mock('viem', () => ({
  ...jest.requireActual<typeof import('viem')>('viem'),
  createWalletClient: jest.fn(),
  createPublicClient: jest.fn(),
}));

const completeAttestation = {
  messages: [{ status: 'complete', message: '0xabc', attestation: '0xdef' }],
};

describe('CctpService', () => {
  let service: CctpService;
  let configService: DeepMocked<ConfigService>;
  let writeContract: jest.Mock;
  let waitForTransactionReceipt: jest.Mock;
  let fetchSpy: jest.SpyInstance;

  beforeEach(async () => {
    configService = createMock<ConfigService>();
    configService.get.mockReturnValue(undefined);
    configService.getOrThrow.mockReturnValue(generatePrivateKey());

    writeContract = jest
      .fn()
      .mockResolvedValueOnce('0xapprove')
      .mockResolvedValueOnce('0xburn')
      .mockResolvedValueOnce('0xmint');
    waitForTransactionReceipt = jest
      .fn()
      .mockResolvedValue({ status: 'success' });
    (createWalletClient as jest.Mock).mockReturnValue({ writeContract });
    (createPublicClient as jest.Mock).mockReturnValue({
      waitForTransactionReceipt,
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        CctpService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = moduleRef.get(CctpService);
    fetchSpy = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('bridgeToBase()', () => {
    it('approves, burns on Arc, waits for Circle, then mints on Base', async () => {
      fetchSpy.mockResolvedValue(Response.json(completeAttestation));

      await service.bridgeToBase('50.5');

      const calls = writeContract.mock.calls.map(
        ([call]: [{ functionName: string; args: unknown[] }]) => call,
      );
      expect(calls.map((call) => call.functionName)).toEqual([
        'approve',
        'depositForBurn',
        'receiveMessage',
      ]);
      expect(calls[0].args[1]).toBe(50_500_000n);
      expect(calls[1].args[0]).toBe(50_500_000n);
      expect(calls[1].args[1]).toBe(6);
      expect(calls[2].args).toEqual(['0xabc', '0xdef']);
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://iris-api.circle.com/v2/messages/26?transactionHash=0xburn',
      );
    });

    it('keeps polling until the attestation is complete', async () => {
      jest.useFakeTimers();
      fetchSpy
        .mockResolvedValueOnce(new Response(null, { status: 404 }))
        .mockResolvedValueOnce(
          Response.json({ messages: [{ status: 'pending_confirmations' }] }),
        )
        .mockResolvedValueOnce(Response.json(completeAttestation));

      const promise = service.bridgeToBase('50');
      await jest.advanceTimersByTimeAsync(4000);
      await promise;

      expect(fetchSpy).toHaveBeenCalledTimes(3);
      expect(writeContract).toHaveBeenCalledTimes(3);
    });

    it('stops before minting when the burn fails on-chain', async () => {
      waitForTransactionReceipt
        .mockResolvedValueOnce({ status: 'success' })
        .mockResolvedValueOnce({ status: 'reverted' });

      await expect(service.bridgeToBase('50')).rejects.toBeInstanceOf(
        BridgeFailedException,
      );
      expect(writeContract).toHaveBeenCalledTimes(2);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('gives up when Circle never completes the attestation', async () => {
      jest.useFakeTimers();
      fetchSpy.mockImplementation(() =>
        Promise.resolve(new Response(null, { status: 404 })),
      );

      const promise = service.bridgeToBase('50');
      const assertion = expect(promise).rejects.toBeInstanceOf(
        BridgeFailedException,
      );
      await jest.advanceTimersByTimeAsync(120_000);
      await assertion;
      expect(writeContract).toHaveBeenCalledTimes(2);
    });
  });
});
