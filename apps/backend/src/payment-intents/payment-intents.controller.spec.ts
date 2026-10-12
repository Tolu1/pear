import { INestApplication, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { PaymentIntentsController } from './payment-intents.controller';
import { PaymentIntentsService } from './payment-intents.service';
import { TokensService } from '../tokens/tokens.service';
import { IsValidRailIdConstraint } from '../tokens/validators/is-valid-rail-id.validator';
import { ServiceAuthGuard } from '../common/guards/service-auth.guard';
import { PaymentIntentNotFoundException } from './exceptions/payment-intent-not-found.exception';
import { PaymentIntentConflictException } from './exceptions/payment-intent-conflict.exception';
import { PaymentIntentStatus } from './enums/payment-intent-status.enum';
import { createControllerApp } from '../../test/utils/create-controller-app';
import { createMock, DeepMocked } from '../../test/utils/create-mock';
import {
  makeAddress,
  makePaymentIntent,
  makeTokenRail,
  makeTxHash,
} from '../../test/factories';

describe('PaymentIntentsController (HTTP)', () => {
  let app: INestApplication;
  let paymentIntentsService: DeepMocked<PaymentIntentsService>;
  let tokensService: DeepMocked<TokensService>;
  let configService: DeepMocked<ConfigService>;

  const validBody = () => ({
    quoteId: 'qt_1',
    railId: 'usdc-base',
    fromAddress: makeAddress(),
    merchantDomain: 'temu.com',
  });

  beforeAll(async () => {
    paymentIntentsService = createMock<PaymentIntentsService>();
    tokensService = createMock<TokensService>();
    configService = createMock<ConfigService>();
    configService.getOrThrow.mockReturnValue('service-api-key-test');

    app = await createControllerApp({
      controllers: [PaymentIntentsController],
      providers: [
        { provide: PaymentIntentsService, useValue: paymentIntentsService },
        { provide: TokensService, useValue: tokensService },
        {
          provide: IsValidRailIdConstraint,
          useValue: new IsValidRailIdConstraint(tokensService),
        },
        { provide: ConfigService, useValue: configService },
        {
          provide: ServiceAuthGuard,
          useValue: new ServiceAuthGuard(configService),
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    tokensService.findRail.mockReturnValue(makeTokenRail({ id: 'usdc-base' }));
    configService.getOrThrow.mockReturnValue('service-api-key-test');
  });

  describe('POST /v1/payment-intents', () => {
    it('creates a payment intent and returns its response shape', async () => {
      const intent = makePaymentIntent();
      paymentIntentsService.create.mockResolvedValue(intent);

      const response = await request(app.getHttpServer())
        .post('/v1/payment-intents')
        .send(validBody())
        .expect(201);

      expect(response.body.id).toBe(intent.id);
      expect(response.body.quote.id).toBe(intent.quote.id);
      expect(response.body.rail).not.toHaveProperty('confirmations');
    });

    it('returns 400 when the rail id is unsupported', async () => {
      tokensService.findRail.mockImplementation(() => {
        throw new Error('not supported');
      });

      const response = await request(app.getHttpServer())
        .post('/v1/payment-intents')
        .send({ ...validBody(), railId: 'unsupported-rail' })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('not a supported rail'),
        ]),
      );
    });

    it('returns 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/v1/payment-intents')
        .send({})
        .expect(400);
      expect(paymentIntentsService.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /v1/payment-intents/:id', () => {
    it('returns the matching intent', async () => {
      const intent = makePaymentIntent({ id: 'pi_1' });
      paymentIntentsService.findOne.mockResolvedValue(intent);

      const response = await request(app.getHttpServer())
        .get('/v1/payment-intents/pi_1')
        .expect(200);

      expect(response.body.id).toBe('pi_1');
    });

    it('returns 404 for an unknown intent', async () => {
      paymentIntentsService.findOne.mockRejectedValue(
        new PaymentIntentNotFoundException(),
      );

      await request(app.getHttpServer())
        .get('/v1/payment-intents/missing')
        .expect(404);
    });
  });

  describe('GET /v1/payment-intents/:id/status', () => {
    it('returns just the id and status', async () => {
      paymentIntentsService.findOne.mockResolvedValue(
        makePaymentIntent({
          id: 'pi_1',
          status: PaymentIntentStatus.PROCESSING,
        }),
      );

      const response = await request(app.getHttpServer())
        .get('/v1/payment-intents/pi_1/status')
        .expect(200);

      expect(response.body).toEqual({ id: 'pi_1', status: 'processing' });
    });
  });

  describe('GET /v1/payment-intents/:id/card', () => {
    it('returns the virtual card when the intent allows it', async () => {
      paymentIntentsService.getCard.mockResolvedValue({
        number: '4242424242424242',
        expiry: '12/30',
        cvv: '123',
        name: 'Test',
        billingAddress: {
          line1: '440 N Barranca Avenue',
          line2: '#4496',
          city: 'Covina',
          state: 'CA',
          zip: '91723',
          country: 'US',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/v1/payment-intents/pi_1/card')
        .expect(200);

      expect(response.body.number).toBe('4242424242424242');
    });

    it('returns 403 when card details are not available', async () => {
      paymentIntentsService.getCard.mockRejectedValue(
        new ForbiddenException('Card details not available'),
      );

      await request(app.getHttpServer())
        .get('/v1/payment-intents/pi_1/card')
        .expect(403);
    });
  });

  describe('POST /v1/payment-intents/:id/submit', () => {
    it('submits a transaction hash and returns the updated intent', async () => {
      const txHash = makeTxHash();
      const intent = makePaymentIntent({
        id: 'pi_1',
        status: PaymentIntentStatus.PROCESSING,
        txHash,
      });
      paymentIntentsService.submit.mockResolvedValue(intent);

      const response = await request(app.getHttpServer())
        .post('/v1/payment-intents/pi_1/submit')
        .send({ txHash })
        .expect(201);

      expect(response.body.status).toBe('processing');
      expect(paymentIntentsService.submit).toHaveBeenCalledWith('pi_1', txHash);
    });

    it('returns 400 when the txHash is not a 32-byte hex string', async () => {
      await request(app.getHttpServer())
        .post('/v1/payment-intents/pi_1/submit')
        .send({ txHash: '0xnope' })
        .expect(400);
      expect(paymentIntentsService.submit).not.toHaveBeenCalled();
    });

    it('returns 409 when the intent is no longer awaiting transfer', async () => {
      paymentIntentsService.submit.mockRejectedValue(
        new PaymentIntentConflictException(),
      );

      await request(app.getHttpServer())
        .post('/v1/payment-intents/pi_1/submit')
        .send({ txHash: makeTxHash() })
        .expect(409);
    });
  });

  describe('POST /v1/payment-intents/:id/complete', () => {
    const ok = 'service-api-key-test';

    it('returns 204 when called with a valid service API key', async () => {
      paymentIntentsService.complete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/v1/payment-intents/pi_1/complete')
        .set('x-service-api-key', ok)
        .expect(204);
    });

    it('returns 401 when the service API key is missing', async () => {
      await request(app.getHttpServer())
        .post('/v1/payment-intents/pi_1/complete')
        .expect(401);
      expect(paymentIntentsService.complete).not.toHaveBeenCalled();
    });

    it('returns 401 when the service API key is wrong', async () => {
      await request(app.getHttpServer())
        .post('/v1/payment-intents/pi_1/complete')
        .set('x-service-api-key', 'wrong-key-same-length')
        .expect(401);
    });

    it('returns 409 when the intent is not in processing state', async () => {
      paymentIntentsService.complete.mockRejectedValue(
        new PaymentIntentConflictException(),
      );

      await request(app.getHttpServer())
        .post('/v1/payment-intents/pi_1/complete')
        .set('x-service-api-key', ok)
        .expect(409);
    });
  });
});
