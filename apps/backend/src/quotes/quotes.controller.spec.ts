import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import { TokensService } from '../tokens/tokens.service';
import { IsValidTokenIdConstraint } from '../tokens/validators/is-valid-token-id.validator';
import { QuoteNotFoundException } from './exceptions/quote-not-found.exception';
import { createControllerApp } from '../../test/utils/create-controller-app';
import { createMock, DeepMocked } from '../../test/utils/create-mock';
import { makeQuote, makeToken } from '../../test/factories';

describe('QuotesController (HTTP)', () => {
  let app: INestApplication;
  let quotesService: DeepMocked<QuotesService>;
  let tokensService: DeepMocked<TokensService>;

  beforeAll(async () => {
    quotesService = createMock<QuotesService>();
    tokensService = createMock<TokensService>();

    app = await createControllerApp({
      controllers: [QuotesController],
      providers: [
        { provide: QuotesService, useValue: quotesService },
        { provide: TokensService, useValue: tokensService },
        {
          provide: IsValidTokenIdConstraint,
          useValue: new IsValidTokenIdConstraint(tokensService),
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    tokensService.findOne.mockReturnValue(makeToken());
  });

  describe('POST /v1/quotes', () => {
    it('creates a quote and returns it', async () => {
      const quote = makeQuote({ amount: '100.00', tokenId: 'usd-coin' });
      quotesService.create.mockResolvedValue(quote);

      const response = await request(app.getHttpServer())
        .post('/v1/quotes')
        .send({ amount: '100.00', currencyCode: 'USD', tokenId: 'usd-coin' })
        .expect(201);

      expect(response.body.id).toBe(quote.id);
      expect(quotesService.create).toHaveBeenCalledWith({
        amount: '100.00',
        currencyCode: 'USD',
        tokenId: 'usd-coin',
      });
    });

    it('returns 400 when the body is missing', async () => {
      await request(app.getHttpServer())
        .post('/v1/quotes')
        .send({})
        .expect(400);
      expect(quotesService.create).not.toHaveBeenCalled();
    });

    it('returns 400 for unsupported currency codes', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/quotes')
        .send({ amount: '100', currencyCode: 'XYZ', tokenId: 'usd-coin' })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('currencyCode')]),
      );
    });

    it('returns 400 when the token id is not supported', async () => {
      tokensService.findOne.mockImplementation(() => {
        throw new QuoteNotFoundException();
      });

      const response = await request(app.getHttpServer())
        .post('/v1/quotes')
        .send({ amount: '100', currencyCode: 'USD', tokenId: 'fake-token' })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('not a supported token'),
        ]),
      );
    });

    it('returns 400 when amount is not numeric', async () => {
      await request(app.getHttpServer())
        .post('/v1/quotes')
        .send({ amount: 'abc', currencyCode: 'USD', tokenId: 'usd-coin' })
        .expect(400);
    });
  });

  describe('GET /v1/quotes/:id', () => {
    it('returns the matching quote', async () => {
      const quote = makeQuote({ id: 'qt_1' });
      quotesService.findOne.mockResolvedValue(quote);

      const response = await request(app.getHttpServer())
        .get('/v1/quotes/qt_1')
        .expect(200);

      expect(response.body.id).toBe('qt_1');
    });

    it('returns 404 when the quote is unknown', async () => {
      quotesService.findOne.mockRejectedValue(new QuoteNotFoundException());

      const response = await request(app.getHttpServer())
        .get('/v1/quotes/missing')
        .expect(404);

      expect(response.body.message).toBe('Quote not found');
    });
  });
});
