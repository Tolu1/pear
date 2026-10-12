import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Challenge } from 'mppx';
import { Mppx } from 'mppx/client';
import { generatePrivateKey } from 'viem/accounts';
import { LasoService } from './laso.service';
import { LasoRequestFailedException } from './exceptions/laso-request-failed.exception';
import { LasoCardNotReadyException } from './exceptions/laso-card-not-ready.exception';
import { createMock, DeepMocked } from '../../test/utils/create-mock';

jest.mock('@x402/extensions/sign-in-with-x', () => ({
  wrapFetchWithSIWx: () => () =>
    Promise.resolve(
      Response.json({ auth: { id_token: 'id-token', expires_in: '3600' } }),
    ),
}));

const readyCardData = {
  card_id: 'card_123',
  status: 'ready',
  usd_amount: 50,
  card_details: {
    card_number: '4111111111111111',
    exp_month: '12',
    exp_year: '2027',
    cvv: '123',
    billing_address: {
      name: 'Laso Finance',
      line_1: '440 N Barranca Avenue',
      line_2: '#4496',
      city: 'Covina',
      state: 'CA',
      zip: '91723',
      country: 'US',
    },
  },
};

describe('LasoService', () => {
  let service: LasoService;
  let configService: DeepMocked<ConfigService>;
  let fetchSpy: jest.SpyInstance;

  beforeEach(async () => {
    configService = createMock<ConfigService>();
    configService.get.mockReturnValue(undefined);
    configService.getOrThrow.mockReturnValue(generatePrivateKey());

    const moduleRef = await Test.createTestingModule({
      providers: [
        LasoService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = moduleRef.get(LasoService);
    fetchSpy = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('getIssuanceCost()', () => {
    it('reads the total from the 402 quote and derives the fee', async () => {
      fetchSpy.mockResolvedValue(new Response(null, { status: 402 }));
      jest.spyOn(Challenge, 'fromResponse').mockReturnValue({
        request: { amount: '51200000', methodDetails: { decimals: 6 } },
      } as never);

      const cost = await service.getIssuanceCost('50');

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://laso.finance/get-card?amount=50',
      );
      expect(cost).toEqual({ amount: '50', fee: '1.2', total: '51.2' });
    });

    it('throws when Laso does not answer with a 402 quote', async () => {
      fetchSpy.mockResolvedValue(new Response(null, { status: 500 }));

      await expect(service.getIssuanceCost('50')).rejects.toBeInstanceOf(
        LasoRequestFailedException,
      );
    });
  });

  describe('orderCard()', () => {
    it('pays capped at the quoted total and returns the card id', async () => {
      const paidFetch = jest
        .fn()
        .mockResolvedValue(Response.json({ card: { card_id: 'card_123' } }));
      const createSpy = jest
        .spyOn(Mppx, 'create')
        .mockReturnValue({ fetch: paidFetch } as never);

      const cardId = await service.orderCard({
        amount: '50',
        fee: '0',
        total: '50',
      });

      expect(cardId).toBe('card_123');
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({ polyfill: false }),
      );
      expect(paidFetch).toHaveBeenCalledWith(
        'https://laso.finance/get-card?amount=50',
      );
    });

    it('throws when the paid request fails', async () => {
      jest.spyOn(Mppx, 'create').mockReturnValue({
        fetch: jest.fn().mockResolvedValue(new Response(null, { status: 402 })),
      } as never);

      await expect(
        service.orderCard({ amount: '50', fee: '0', total: '50' }),
      ).rejects.toBeInstanceOf(LasoRequestFailedException);
    });
  });

  describe('getCard()', () => {
    it('polls until the card is ready and returns it', async () => {
      jest.useFakeTimers();
      fetchSpy
        .mockResolvedValueOnce(
          Response.json({ card_id: 'card_123', status: 'pending' }),
        )
        .mockResolvedValueOnce(Response.json(readyCardData));

      const promise = service.getCard('card_123');
      await jest.advanceTimersByTimeAsync(2500);
      const card = await promise;

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://laso.finance/get-card-data?card_id=card_123',
        { headers: { Authorization: 'Bearer id-token' } },
      );
      expect(card).toEqual({
        cardId: 'card_123',
        usdAmount: 50,
        cardNumber: '4111111111111111',
        expMonth: '12',
        expYear: '2027',
        cvv: '123',
        billingAddress: {
          name: 'Laso Finance',
          line1: '440 N Barranca Avenue',
          line2: '#4496',
          city: 'Covina',
          state: 'CA',
          zip: '91723',
          country: 'US',
        },
      });
    });

    it('gives up when the card is never ready', async () => {
      jest.useFakeTimers();
      fetchSpy.mockImplementation(() =>
        Promise.resolve(
          Response.json({ card_id: 'card_123', status: 'pending' }),
        ),
      );

      const promise = service.getCard('card_123');
      const assertion = expect(promise).rejects.toBeInstanceOf(
        LasoCardNotReadyException,
      );
      await jest.advanceTimersByTimeAsync(60_000);
      await assertion;
    });

    it('throws when reading the card fails', async () => {
      fetchSpy.mockResolvedValue(new Response(null, { status: 401 }));

      await expect(service.getCard('card_123')).rejects.toBeInstanceOf(
        LasoRequestFailedException,
      );
    });
  });
});
