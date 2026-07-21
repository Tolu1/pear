import { Test } from '@nestjs/testing';
import { QuotesService } from './quotes.service';
import { QuotesRepository } from './quotes.repository';
import { FiatToCryptoService } from '../rates/fiat-to-crypto.service';
import { QuoteAlreadyConsumedException } from './exceptions/quote-already-consumed.exception';
import { QuoteExpiredException } from './exceptions/quote-expired.exception';
import { QuoteNotFoundException } from './exceptions/quote-not-found.exception';
import { createMock, DeepMocked } from '../../test/utils/create-mock';
import { makeQuote } from '../../test/factories';

describe('QuotesService', () => {
  let service: QuotesService;
  let repo: DeepMocked<QuotesRepository>;
  let fiatToCrypto: DeepMocked<FiatToCryptoService>;

  beforeEach(async () => {
    repo = createMock<QuotesRepository>();
    fiatToCrypto = createMock<FiatToCryptoService>();

    const moduleRef = await Test.createTestingModule({
      providers: [
        QuotesService,
        { provide: QuotesRepository, useValue: repo },
        { provide: FiatToCryptoService, useValue: fiatToCrypto },
      ],
    }).compile();

    service = moduleRef.get(QuotesService);
  });

  describe('create()', () => {
    it('persists a quote with conversion result and a 15-minute TTL', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-05-11T12:00:00Z'));
      fiatToCrypto.convert.mockResolvedValue({
        cryptoAmount: '100.000000',
        rate: '1.00',
      });
      repo.create.mockImplementation((data) =>
        Promise.resolve({
          ...data,
          metadata: null,
          consumedAt: null,
          createdAt: new Date('2026-05-11T12:00:00Z'),
        } as Awaited<ReturnType<QuotesRepository['create']>>),
      );

      const quote = await service.create({
        amount: '100.00',
        currencyCode: 'USD',
        tokenId: 'usd-coin',
      });

      expect(fiatToCrypto.convert).toHaveBeenCalledWith(
        '100.00',
        'USD',
        'usd-coin',
      );
      expect(quote.id).toMatch(/^qt_/);
      expect(quote.cryptoAmount).toBe('100.000000');
      expect(quote.rate).toBe('1.00');
      expect(quote.expiresAt.getTime()).toBe(
        new Date('2026-05-11T12:15:00Z').getTime(),
      );

      jest.useRealTimers();
    });
  });

  describe('findOne()', () => {
    it('returns a quote mapped to the domain shape', async () => {
      const row = {
        id: 'qt_1',
        amount: '100.00',
        currencyCode: 'USD',
        cryptoAmount: '100.000000',
        rate: '1.0',
        tokenId: 'usd-coin',
        expiresAt: new Date(),
        consumedAt: null,
        createdAt: new Date(),
      };
      repo.findOne.mockResolvedValue(row);

      const quote = await service.findOne('qt_1');

      expect(quote).toEqual(row);
    });

    it('propagates QuoteNotFoundException', async () => {
      repo.findOne.mockRejectedValue(new QuoteNotFoundException());

      await expect(service.findOne('missing')).rejects.toThrow(
        QuoteNotFoundException,
      );
    });
  });

  describe('findActive()', () => {
    it('returns the quote when it is unconsumed and not expired', async () => {
      const future = new Date(Date.now() + 60_000);
      repo.findOne.mockResolvedValue(
        makeQuote({
          id: 'qt_ok',
          expiresAt: future,
          consumedAt: null,
        }) as never,
      );

      const quote = await service.findActive('qt_ok');

      expect(quote.id).toBe('qt_ok');
    });

    it('throws QuoteAlreadyConsumedException when the quote was already consumed', async () => {
      repo.findOne.mockResolvedValue(
        makeQuote({
          expiresAt: new Date(Date.now() + 60_000),
          consumedAt: new Date(),
        }) as never,
      );

      await expect(service.findActive('qt_used')).rejects.toThrow(
        QuoteAlreadyConsumedException,
      );
    });

    it('throws QuoteExpiredException when the quote has expired', async () => {
      repo.findOne.mockResolvedValue(
        makeQuote({
          expiresAt: new Date(Date.now() - 60_000),
          consumedAt: null,
        }) as never,
      );

      await expect(service.findActive('qt_old')).rejects.toThrow(
        QuoteExpiredException,
      );
    });
  });

  describe('markConsumed()', () => {
    it('updates the quote with a consumedAt timestamp', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-05-11T12:30:00Z'));

      await service.markConsumed('qt_1');

      expect(repo.update).toHaveBeenCalledWith('qt_1', {
        consumedAt: new Date('2026-05-11T12:30:00Z'),
      });

      jest.useRealTimers();
    });
  });
});
