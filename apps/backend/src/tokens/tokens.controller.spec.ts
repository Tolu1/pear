import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';
import { TokenNotFoundException } from './exceptions/token-not-found.exception';
import { createControllerApp } from '../../test/utils/create-controller-app';
import { createMock, DeepMocked } from '../../test/utils/create-mock';
import { makeToken } from '../../test/factories';

describe('TokensController (HTTP)', () => {
  let app: INestApplication;
  let tokensService: DeepMocked<TokensService>;

  beforeAll(async () => {
    tokensService = createMock<TokensService>();
    app = await createControllerApp({
      controllers: [TokensController],
      providers: [{ provide: TokensService, useValue: tokensService }],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /v1/tokens', () => {
    it('returns the list of tokens projected to response DTOs', async () => {
      tokensService.findAll.mockReturnValue([
        makeToken({ id: 'usd-coin', symbol: 'USDC' }),
      ]);

      const response = await request(app.getHttpServer())
        .get('/v1/tokens')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        id: 'usd-coin',
        symbol: 'USDC',
      });
      expect(response.body[0].rails[0]).not.toHaveProperty('confirmations');
    });
  });

  describe('GET /v1/tokens/:id', () => {
    it('returns the matching token', async () => {
      tokensService.findOne.mockReturnValue(makeToken({ id: 'usd-coin' }));

      const response = await request(app.getHttpServer())
        .get('/v1/tokens/usd-coin')
        .expect(200);

      expect(response.body.id).toBe('usd-coin');
    });

    it('returns 404 with the exception message when the token is unknown', async () => {
      tokensService.findOne.mockImplementation(() => {
        throw new TokenNotFoundException();
      });

      const response = await request(app.getHttpServer())
        .get('/v1/tokens/unknown')
        .expect(404);

      expect(response.body.message).toBe('Token not found');
    });
  });
});
