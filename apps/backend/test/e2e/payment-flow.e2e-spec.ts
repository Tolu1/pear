import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { base } from 'viem/chains';
import { createTestApp } from '../utils/create-test-app';
import { truncateAll } from '../utils/truncate';
import type { TestDatabase } from '../utils/postgres-container';
import { BlockchainService } from '../../src/blockchain/blockchain.service';
import { VirtualCardService } from '../../src/virtual-card/virtual-card.service';
import { createMock, DeepMocked } from '../utils/create-mock';
import { makeTxHash } from '../factories';

const testDb = (): TestDatabase =>
  (globalThis as Record<string, unknown>).__TEST_DB__ as TestDatabase;

describe('Payment flow (e2e)', () => {
  let app: INestApplication;
  let blockchainService: DeepMocked<BlockchainService>;
  let virtualCardService: DeepMocked<VirtualCardService>;
  let fetchSpy: jest.SpyInstance;

  beforeAll(async () => {
    blockchainService = createMock<BlockchainService>();
    virtualCardService = createMock<VirtualCardService>();
    virtualCardService.issue.mockResolvedValue('card_123');
    virtualCardService.get.mockResolvedValue({
      number: '4111111111111111',
      expiry: '12/27',
      cvv: '123',
      name: 'Pear',
    });

    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(((
      url: string,
    ) => {
      if (typeof url === 'string' && url.includes('/coins/usd-coin')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ market_data: { current_price: { usd: 1 } } }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        );
      }
      throw new Error(`unexpected fetch: ${url}`);
    }) as typeof global.fetch);

    await truncateAll(testDb().db);

    app = await createTestApp({
      db: testDb().db,
      databaseUrl: testDb().url,
      customise: (builder) =>
        builder
          .overrideProvider(BlockchainService)
          .useValue(blockchainService)
          .overrideProvider(VirtualCardService)
          .useValue(virtualCardService),
    });
  });

  afterAll(async () => {
    fetchSpy.mockRestore();
    await app.close();
  });

  it('completes the quote → intent → submit → complete lifecycle end-to-end', async () => {
    const fromAddress = '0x1111111111111111111111111111111111111111';
    const txHash = makeTxHash();

    const quoteRes = await request(app.getHttpServer())
      .post('/v1/quotes')
      .send({ amount: '50.00', currencyCode: 'USD', tokenId: 'usd-coin' })
      .expect(201);

    expect(quoteRes.body).toMatchObject({
      amount: '50.0000',
      currencyCode: 'USD',
      tokenId: 'usd-coin',
    });
    expect(parseFloat(quoteRes.body.rate)).toBe(1);
    expect(parseFloat(quoteRes.body.cryptoAmount)).toBe(50);
    const quoteId: string = quoteRes.body.id;

    const intentRes = await request(app.getHttpServer())
      .post('/v1/payment-intents')
      .send({
        quoteId,
        railId: 'usdc-base',
        fromAddress,
        merchantDomain: 'temu.com',
      })
      .expect(201);

    expect(intentRes.body).toMatchObject({
      status: 'requires_transfer',
      fromAddress,
      merchantDomain: 'temu.com',
    });
    expect(intentRes.body.quote.id).toBe(quoteId);
    expect(intentRes.body.rail.id).toBe('usdc-base');
    expect(intentRes.body.rail.chainId).toBe(base.id);
    const intentId: string = intentRes.body.id;

    const reusedQuoteRes = await request(app.getHttpServer())
      .post('/v1/payment-intents')
      .send({
        quoteId,
        railId: 'usdc-base',
        fromAddress,
        merchantDomain: 'temu.com',
      });
    expect(reusedQuoteRes.status).toBeGreaterThanOrEqual(400);

    const statusBeforeSubmit = await request(app.getHttpServer())
      .get(`/v1/payment-intents/${intentId}/status`)
      .expect(200);
    expect(statusBeforeSubmit.body).toEqual({
      id: intentId,
      status: 'requires_transfer',
    });

    const cardBeforeSubmit = await request(app.getHttpServer()).get(
      `/v1/payment-intents/${intentId}/card`,
    );
    expect(cardBeforeSubmit.status).toBe(403);

    blockchainService.assertTransfer.mockResolvedValue({
      status: 'success',
    } as never);

    const submitRes = await request(app.getHttpServer())
      .post(`/v1/payment-intents/${intentId}/submit`)
      .send({ txHash })
      .expect(201);

    expect(submitRes.body.status).toBe('processing');
    expect(submitRes.body.txHash).toBe(txHash);
    expect(blockchainService.assertTransfer).toHaveBeenCalledTimes(1);
    expect(virtualCardService.issue).toHaveBeenCalledTimes(1);

    const cardRes = await request(app.getHttpServer())
      .get(`/v1/payment-intents/${intentId}/card`)
      .expect(200);
    expect(cardRes.body.number).toBeTruthy();
    expect(cardRes.body.cvv).toBeTruthy();

    await request(app.getHttpServer())
      .post(`/v1/payment-intents/${intentId}/complete`)
      .expect(401);

    await request(app.getHttpServer())
      .post(`/v1/payment-intents/${intentId}/complete`)
      .set('x-service-api-key', 'test-service-api-key')
      .expect(204);

    const finalStatus = await request(app.getHttpServer())
      .get(`/v1/payment-intents/${intentId}/status`)
      .expect(200);
    expect(finalStatus.body.status).toBe('succeeded');
  });
});
