jest.mock('@nestjs-cls/transactional', () => ({
  Transactional: () => () => undefined,
  TransactionHost: class {},
}));

import { Test } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { parseUnits } from 'viem';
import { PaymentIntentsService } from './payment-intents.service';
import { PaymentIntentsRepository } from './payment-intents.repository';
import { QuotesService } from '../quotes/quotes.service';
import { VirtualCardService } from '../virtual-card/virtual-card.service';
import { TokensService } from '../tokens/tokens.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PaymentIntentStatus } from './enums/payment-intent-status.enum';
import { PaymentIntentConflictException } from './exceptions/payment-intent-conflict.exception';
import { UnsupportedCardCurrencyException } from './exceptions/unsupported-card-currency.exception';
import { createMock, DeepMocked } from '../../test/utils/create-mock';
import {
  makeAddress,
  makePaymentIntent,
  makeQuote,
  makeToken,
  makeTokenRail,
  makeTxHash,
} from '../../test/factories';

describe('PaymentIntentsService', () => {
  let service: PaymentIntentsService;
  let repo: DeepMocked<PaymentIntentsRepository>;
  let quotesService: DeepMocked<QuotesService>;
  let virtualCardService: DeepMocked<VirtualCardService>;
  let tokensService: DeepMocked<TokensService>;
  let blockchainService: DeepMocked<BlockchainService>;

  beforeEach(async () => {
    repo = createMock<PaymentIntentsRepository>();
    quotesService = createMock<QuotesService>();
    virtualCardService = createMock<VirtualCardService>();
    tokensService = createMock<TokensService>();
    blockchainService = createMock<BlockchainService>();

    const moduleRef = await Test.createTestingModule({
      providers: [
        PaymentIntentsService,
        { provide: PaymentIntentsRepository, useValue: repo },
        { provide: QuotesService, useValue: quotesService },
        { provide: VirtualCardService, useValue: virtualCardService },
        { provide: TokensService, useValue: tokensService },
        { provide: BlockchainService, useValue: blockchainService },
      ],
    }).compile();

    service = moduleRef.get(PaymentIntentsService);
  });

  describe('create()', () => {
    it('creates an intent, marks the quote consumed, and returns the domain object', async () => {
      const quote = makeQuote();
      const rail = makeTokenRail();
      const fromAddress = makeAddress();

      quotesService.findActive.mockResolvedValue(quote);
      tokensService.findRail.mockReturnValue(rail);
      repo.create.mockImplementation((data) =>
        Promise.resolve({
          ...data,
          metadata: data.metadata ?? null,
          txHash: null,
          cardId: null,
          status: PaymentIntentStatus.REQUIRES_TRANSFER,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Awaited<ReturnType<PaymentIntentsRepository['create']>>),
      );

      const intent = await service.create({
        quoteId: quote.id,
        railId: rail.id,
        fromAddress,
        merchantDomain: 'temu.com',
      });

      expect(intent.id).toMatch(/^pi_/);
      expect(intent.quote).toEqual(quote);
      expect(intent.rail).toEqual(rail);
      expect(intent.status).toBe(PaymentIntentStatus.REQUIRES_TRANSFER);
      expect(quotesService.markConsumed).toHaveBeenCalledWith(quote.id);
    });

    it('rejects a quote that is not in USD without writing the intent', async () => {
      quotesService.findActive.mockResolvedValue(
        makeQuote({ currencyCode: 'NGN' }),
      );

      await expect(
        service.create({
          quoteId: 'qt_x',
          railId: 'usdc-base',
          fromAddress: makeAddress(),
          merchantDomain: 'temu.com',
        }),
      ).rejects.toThrow(UnsupportedCardCurrencyException);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('propagates exceptions from the quote lookup without writing the intent', async () => {
      quotesService.findActive.mockRejectedValue(new Error('expired'));

      await expect(
        service.create({
          quoteId: 'qt_x',
          railId: 'usdc-base',
          fromAddress: makeAddress(),
          merchantDomain: 'temu.com',
        }),
      ).rejects.toThrow('expired');
      expect(repo.create).not.toHaveBeenCalled();
      expect(quotesService.markConsumed).not.toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('hydrates the intent row with quote and rail data', async () => {
      const quote = makeQuote();
      const rail = makeTokenRail();
      repo.findOne.mockResolvedValue({
        id: 'pi_1',
        quoteId: quote.id,
        railId: rail.id,
        status: PaymentIntentStatus.REQUIRES_TRANSFER,
        fromAddress: makeAddress(),
        merchantDomain: 'temu.com',
        metadata: null,
        txHash: null,
        cardId: null,
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      quotesService.findOne.mockResolvedValue(quote);
      tokensService.findRail.mockReturnValue(rail);

      const intent = await service.findOne('pi_1');

      expect(intent.quote).toEqual(quote);
      expect(intent.rail).toEqual(rail);
      expect(tokensService.findRail).toHaveBeenCalledWith(rail.id);
    });
  });

  describe('getCard()', () => {
    it("returns the intent's card when the intent is processing", async () => {
      const intent = makePaymentIntent({
        status: PaymentIntentStatus.PROCESSING,
        cardId: 'card_123',
      });
      jest.spyOn(service, 'findOne').mockResolvedValue(intent);
      virtualCardService.get.mockResolvedValue({
        number: '4242424242424242',
        expiry: '12/30',
        cvv: '123',
        name: 'Pear',
        billingAddress: {
          line1: '440 N Barranca Avenue',
          line2: '#4496',
          city: 'Covina',
          state: 'CA',
          zip: '91723',
          country: 'US',
        },
      });

      const card = await service.getCard(intent.id);

      expect(virtualCardService.get).toHaveBeenCalledWith('card_123');
      expect(card.number).toBe('4242424242424242');
    });

    it('throws ForbiddenException when the intent is not in processing state', async () => {
      const intent = makePaymentIntent({
        status: PaymentIntentStatus.REQUIRES_TRANSFER,
      });
      jest.spyOn(service, 'findOne').mockResolvedValue(intent);

      await expect(service.getCard(intent.id)).rejects.toThrow(
        ForbiddenException,
      );
      expect(virtualCardService.get).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when the intent has no card yet', async () => {
      const intent = makePaymentIntent({
        status: PaymentIntentStatus.PROCESSING,
        cardId: null,
      });
      jest.spyOn(service, 'findOne').mockResolvedValue(intent);

      await expect(service.getCard(intent.id)).rejects.toThrow(
        ForbiddenException,
      );
      expect(virtualCardService.get).not.toHaveBeenCalled();
    });
  });

  describe('submit()', () => {
    it('asserts the transfer, claims the intent, then issues and saves one card', async () => {
      const token = makeToken({ decimals: 6 });
      const rail = makeTokenRail({ confirmations: 3 });
      const fromAddress = makeAddress();
      const quote = makeQuote({ cryptoAmount: '10.5', tokenId: token.id });
      const intent = makePaymentIntent({
        status: PaymentIntentStatus.REQUIRES_TRANSFER,
        fromAddress,
        quote,
        rail,
      });
      const txHash = makeTxHash();

      const intentRow = {
        id: intent.id,
        quoteId: quote.id,
        railId: rail.id,
        status: PaymentIntentStatus.REQUIRES_TRANSFER,
        fromAddress,
        merchantDomain: intent.merchantDomain,
        metadata: null,
        txHash: null,
        cardId: null,
        expiresAt: intent.expiresAt,
        createdAt: intent.createdAt,
        updatedAt: new Date(),
      };
      const processingRow = {
        ...intentRow,
        status: PaymentIntentStatus.PROCESSING,
        txHash,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(intent);
      tokensService.findOne.mockReturnValue(token);
      repo.findOne.mockResolvedValue(intentRow);
      repo.update
        .mockResolvedValueOnce(processingRow)
        .mockResolvedValueOnce({ ...processingRow, cardId: 'card_123' });
      virtualCardService.issue.mockResolvedValue('card_123');

      const result = await service.submit(intent.id, txHash);

      expect(blockchainService.assertTransfer).toHaveBeenCalledWith(
        txHash,
        {
          from: fromAddress,
          to: rail.paymentAddress,
          value: parseUnits('10.5', 6),
          tokenAddress: rail.tokenAddress,
          chainId: rail.chainId,
        },
        3,
      );
      expect(repo.update).toHaveBeenCalledWith(
        intent.id,
        expect.objectContaining({
          status: PaymentIntentStatus.PROCESSING,
          txHash,
        }),
      );
      expect(virtualCardService.issue).toHaveBeenCalledWith(quote.amount);
      expect(repo.update).toHaveBeenCalledWith(
        intent.id,
        expect.objectContaining({ cardId: 'card_123' }),
      );
      expect(result.status).toBe(PaymentIntentStatus.PROCESSING);
      expect(result.cardId).toBe('card_123');
    });

    it('does not issue a card when another submit claimed the intent first', async () => {
      const intent = makePaymentIntent({
        status: PaymentIntentStatus.REQUIRES_TRANSFER,
      });
      jest.spyOn(service, 'findOne').mockResolvedValue(intent);
      tokensService.findOne.mockReturnValue(makeToken());
      repo.findOne.mockResolvedValue({
        status: PaymentIntentStatus.PROCESSING,
      } as Awaited<ReturnType<PaymentIntentsRepository['findOne']>>);

      await expect(service.submit(intent.id, makeTxHash())).rejects.toThrow(
        PaymentIntentConflictException,
      );
      expect(repo.update).not.toHaveBeenCalled();
      expect(virtualCardService.issue).not.toHaveBeenCalled();
    });

    it('does not issue a card when the database rejects a racing submit', async () => {
      const intent = makePaymentIntent({
        status: PaymentIntentStatus.REQUIRES_TRANSFER,
      });
      jest.spyOn(service, 'findOne').mockResolvedValue(intent);
      tokensService.findOne.mockReturnValue(makeToken());
      repo.findOne.mockResolvedValue({
        status: PaymentIntentStatus.REQUIRES_TRANSFER,
      } as Awaited<ReturnType<PaymentIntentsRepository['findOne']>>);
      repo.update.mockRejectedValue(
        Object.assign(new Error(), { code: '40001' }),
      );

      await expect(service.submit(intent.id, makeTxHash())).rejects.toThrow(
        PaymentIntentConflictException,
      );
      expect(virtualCardService.issue).not.toHaveBeenCalled();
    });

    it('throws PaymentIntentConflictException when the intent is not awaiting transfer', async () => {
      const intent = makePaymentIntent({
        status: PaymentIntentStatus.PROCESSING,
      });
      jest.spyOn(service, 'findOne').mockResolvedValue(intent);

      await expect(service.submit(intent.id, makeTxHash())).rejects.toThrow(
        PaymentIntentConflictException,
      );
      expect(blockchainService.assertTransfer).not.toHaveBeenCalled();
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('does not persist a status update when the chain assertion fails', async () => {
      const intent = makePaymentIntent({
        status: PaymentIntentStatus.REQUIRES_TRANSFER,
      });
      jest.spyOn(service, 'findOne').mockResolvedValue(intent);
      tokensService.findOne.mockReturnValue(makeToken());
      blockchainService.assertTransfer.mockRejectedValue(
        new Error('transfer mismatch'),
      );

      await expect(service.submit(intent.id, makeTxHash())).rejects.toThrow(
        'transfer mismatch',
      );
      expect(repo.update).not.toHaveBeenCalled();
      expect(virtualCardService.issue).not.toHaveBeenCalled();
    });
  });

  describe('complete()', () => {
    it('transitions a processing intent to succeeded', async () => {
      const intent = makePaymentIntent({
        status: PaymentIntentStatus.PROCESSING,
      });
      jest.spyOn(service, 'findOne').mockResolvedValue(intent);

      await service.complete(intent.id);

      expect(repo.update).toHaveBeenCalledWith(
        intent.id,
        expect.objectContaining({
          status: PaymentIntentStatus.SUCCEEDED,
        }),
      );
    });

    it('is a no-op when the intent is already succeeded', async () => {
      const intent = makePaymentIntent({
        status: PaymentIntentStatus.SUCCEEDED,
      });
      jest.spyOn(service, 'findOne').mockResolvedValue(intent);

      await expect(service.complete(intent.id)).resolves.toBeUndefined();
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('throws PaymentIntentConflictException when the intent is not processing', async () => {
      const intent = makePaymentIntent({
        status: PaymentIntentStatus.REQUIRES_TRANSFER,
      });
      jest.spyOn(service, 'findOne').mockResolvedValue(intent);

      await expect(service.complete(intent.id)).rejects.toThrow(
        PaymentIntentConflictException,
      );
      expect(repo.update).not.toHaveBeenCalled();
    });
  });
});
