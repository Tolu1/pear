import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { HealthController } from './health.controller';
import { createControllerApp } from '../../test/utils/create-controller-app';

describe('HealthController (HTTP)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createControllerApp({
      controllers: [HealthController],
      providers: [],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns status ok (excluded from the v1 prefix)', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({ status: 'ok' });
  });
});
