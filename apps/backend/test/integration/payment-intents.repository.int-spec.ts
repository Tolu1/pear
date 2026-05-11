import { PaymentIntentsRepository } from '../../src/payment-intents/payment-intents.repository';
import { PaymentIntentNotFoundException } from '../../src/payment-intents/exceptions/payment-intent-not-found.exception';
import { PaymentIntentStatus } from '../../src/payment-intents/enums/payment-intent-status.enum';
import { QuotesRepository } from '../../src/quotes/quotes.repository';
import {
  createRepoTestModule,
  type RepoTestModule,
} from '../utils/repo-test-module';
import type { TestDatabase } from '../utils/postgres-container';
import { truncateAll } from '../utils/truncate';
import { makeAddress, makeTxHash } from '../factories';

const testDb = (): TestDatabase =>
  (globalThis as Record<string, unknown>).__TEST_DB__ as TestDatabase;

describe('PaymentIntentsRepository (integration)', () => {
  let intentCtx: RepoTestModule<PaymentIntentsRepository>;
  let quoteCtx: RepoTestModule<QuotesRepository>;

  beforeAll(async () => {
    intentCtx = await createRepoTestModule(
      PaymentIntentsRepository,
      testDb().db,
    );
    quoteCtx = await createRepoTestModule(QuotesRepository, testDb().db);
  });

  afterAll(async () => {
    await intentCtx.close();
    await quoteCtx.close();
  });

  beforeEach(async () => {
    await truncateAll(testDb().db);
  });

  const seedQuote = (id: string) =>
    quoteCtx.runInCls(() =>
      quoteCtx.repo.create({
        id,
        amount: '50.00',
        currencyCode: 'USD',
        cryptoAmount: '50.000000',
        rate: '1.0',
        tokenId: 'usd-coin',
        expiresAt: new Date(Date.now() + 60_000),
      }),
    );

  const seedIntent = async (
    overrides: Partial<Parameters<PaymentIntentsRepository['create']>[0]> = {},
  ) => {
    const quoteId = overrides.quoteId ?? `qt_${Date.now()}`;
    await seedQuote(quoteId);
    return intentCtx.runInCls(() =>
      intentCtx.repo.create({
        id: 'pi_test_1',
        quoteId,
        railId: 'usdc-base',
        fromAddress: makeAddress(),
        merchantDomain: 'temu.com',
        metadata: null,
        expiresAt: new Date('2026-05-11T13:00:00Z'),
        ...overrides,
      }),
    );
  };

  describe('create()', () => {
    it('persists an intent with default status requires_transfer', async () => {
      const intent = await seedIntent();

      expect(intent).toMatchObject({
        id: 'pi_test_1',
        railId: 'usdc-base',
        merchantDomain: 'temu.com',
        status: 'requires_transfer',
      });
      expect(intent.createdAt).toBeInstanceOf(Date);
      expect(intent.txHash).toBeNull();
    });

    it('rejects two intents referencing the same quote (unique quoteId)', async () => {
      const quoteId = 'qt_unique_violation';
      await seedQuote(quoteId);

      await intentCtx.runInCls(() =>
        intentCtx.repo.create({
          id: 'pi_a',
          quoteId,
          railId: 'usdc-base',
          fromAddress: makeAddress(),
          merchantDomain: 'temu.com',
          metadata: null,
          expiresAt: new Date(Date.now() + 60_000),
        }),
      );

      await expect(
        intentCtx.runInCls(() =>
          intentCtx.repo.create({
            id: 'pi_b',
            quoteId,
            railId: 'usdc-base',
            fromAddress: makeAddress(),
            merchantDomain: 'temu.com',
            metadata: null,
            expiresAt: new Date(Date.now() + 60_000),
          }),
        ),
      ).rejects.toThrow();
    });

    it('rejects two intents sharing the same txHash (unique txHash)', async () => {
      const sharedTxHash = makeTxHash();
      const quoteA = 'qt_share_tx_a';
      const quoteB = 'qt_share_tx_b';
      await seedQuote(quoteA);
      await seedQuote(quoteB);

      await intentCtx.runInCls(() =>
        intentCtx.repo.create({
          id: 'pi_a',
          quoteId: quoteA,
          railId: 'usdc-base',
          fromAddress: makeAddress(),
          merchantDomain: 'temu.com',
          metadata: null,
          expiresAt: new Date(Date.now() + 60_000),
          txHash: sharedTxHash,
        }),
      );

      await expect(
        intentCtx.runInCls(() =>
          intentCtx.repo.create({
            id: 'pi_b',
            quoteId: quoteB,
            railId: 'usdc-base',
            fromAddress: makeAddress(),
            merchantDomain: 'temu.com',
            metadata: null,
            expiresAt: new Date(Date.now() + 60_000),
            txHash: sharedTxHash,
          }),
        ),
      ).rejects.toThrow();
    });
  });

  describe('findOne()', () => {
    it('returns the persisted intent by id', async () => {
      await seedIntent();

      const found = await intentCtx.runInCls(() =>
        intentCtx.repo.findOne('pi_test_1'),
      );

      expect(found.id).toBe('pi_test_1');
      expect(found.status).toBe('requires_transfer');
    });

    it('throws PaymentIntentNotFoundException for an unknown id', async () => {
      await expect(
        intentCtx.runInCls(() => intentCtx.repo.findOne('pi_missing')),
      ).rejects.toThrow(PaymentIntentNotFoundException);
    });
  });

  describe('update()', () => {
    it('transitions status and persists a txHash', async () => {
      await seedIntent();
      const txHash = makeTxHash();

      const updated = await intentCtx.runInCls(() =>
        intentCtx.repo.update('pi_test_1', {
          status: PaymentIntentStatus.PROCESSING,
          txHash,
        }),
      );

      expect(updated.status).toBe('processing');
      expect(updated.txHash).toBe(txHash);
    });

    it('throws PaymentIntentNotFoundException when updating an unknown id', async () => {
      await expect(
        intentCtx.runInCls(() =>
          intentCtx.repo.update('pi_missing', {
            status: PaymentIntentStatus.PROCESSING,
          }),
        ),
      ).rejects.toThrow(PaymentIntentNotFoundException);
    });
  });
});
