import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { BetaAccessController } from './beta-access.controller';
import { BetaAccessService } from './beta-access.service';
import { ServiceAuthGuard } from '../common/guards/service-auth.guard';
import { createControllerApp } from '../../test/utils/create-controller-app';
import { createMock, DeepMocked } from '../../test/utils/create-mock';

describe('BetaAccessController (HTTP)', () => {
  let app: INestApplication;
  let betaAccessService: DeepMocked<BetaAccessService>;
  let configService: DeepMocked<ConfigService>;
  const KEY = 'service-api-key-test';

  beforeAll(async () => {
    betaAccessService = createMock<BetaAccessService>();
    configService = createMock<ConfigService>();
    configService.getOrThrow.mockReturnValue(KEY);

    app = await createControllerApp({
      controllers: [BetaAccessController],
      providers: [
        { provide: BetaAccessService, useValue: betaAccessService },
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
    configService.getOrThrow.mockReturnValue(KEY);
  });

  describe('POST /v1/beta-access/validate', () => {
    it('returns the validation result for an authorized caller', async () => {
      betaAccessService.validate.mockResolvedValue({
        valid: true,
        remaining: 18,
        limit: 25,
      });

      const response = await request(app.getHttpServer())
        .post('/v1/beta-access/validate')
        .set('x-service-api-key', KEY)
        .send({ code: 'PEAR-TEST' })
        .expect(201);

      expect(response.body).toEqual({ valid: true, remaining: 18, limit: 25 });
      expect(betaAccessService.validate).toHaveBeenCalledWith('PEAR-TEST');
    });

    it('rejects a caller without the service key', async () => {
      await request(app.getHttpServer())
        .post('/v1/beta-access/validate')
        .send({ code: 'PEAR-TEST' })
        .expect(401);

      expect(betaAccessService.validate).not.toHaveBeenCalled();
    });
  });

  describe('POST /v1/beta-access/consume', () => {
    it('consumes a run for an authorized caller', async () => {
      betaAccessService.consume.mockResolvedValue({
        ok: true,
        remaining: 17,
        limit: 25,
      });

      const response = await request(app.getHttpServer())
        .post('/v1/beta-access/consume')
        .set('x-service-api-key', KEY)
        .send({ code: 'PEAR-TEST' })
        .expect(201);

      expect(response.body).toEqual({ ok: true, remaining: 17, limit: 25 });
      expect(betaAccessService.consume).toHaveBeenCalledWith('PEAR-TEST');
    });

    it('rejects a caller without the service key', async () => {
      await request(app.getHttpServer())
        .post('/v1/beta-access/consume')
        .send({ code: 'PEAR-TEST' })
        .expect(401);

      expect(betaAccessService.consume).not.toHaveBeenCalled();
    });
  });
});
