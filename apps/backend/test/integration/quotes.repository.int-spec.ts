import { QuotesRepository } from '../../src/quotes/quotes.repository';
import { QuoteNotFoundException } from '../../src/quotes/exceptions/quote-not-found.exception';
import {
  createRepoTestModule,
  type RepoTestModule,
} from '../utils/repo-test-module';
import type { TestDatabase } from '../utils/postgres-container';
import { truncateAll } from '../utils/truncate';

const testDb = (): TestDatabase =>
  (globalThis as Record<string, unknown>).__TEST_DB__ as TestDatabase;

describe('QuotesRepository (integration)', () => {
  let ctx: RepoTestModule<QuotesRepository>;

  beforeAll(async () => {
    ctx = await createRepoTestModule(QuotesRepository, testDb().db);
  });

  afterAll(async () => {
    await ctx.close();
  });

  beforeEach(async () => {
    await truncateAll(testDb().db);
  });

  const seedQuote = (
    overrides: Partial<Parameters<QuotesRepository['create']>[0]> = {},
  ) =>
    ctx.runInCls(() =>
      ctx.repo.create({
        id: 'qt_test_1',
        amount: '100.00',
        currencyCode: 'USD',
        cryptoAmount: '100.000000',
        rate: '1.0',
        tokenId: 'usd-coin',
        expiresAt: new Date('2026-05-11T12:00:00Z'),
        ...overrides,
      }),
    );

  describe('create()', () => {
    it('persists a quote and returns the saved row', async () => {
      const quote = await seedQuote();

      expect(quote).toMatchObject({
        id: 'qt_test_1',
        amount: '100.0000',
        currencyCode: 'USD',
        tokenId: 'usd-coin',
      });
      expect(quote.createdAt).toBeInstanceOf(Date);
      expect(quote.consumedAt).toBeNull();
    });

    it('rejects duplicate ids with a database error', async () => {
      await seedQuote();

      await expect(seedQuote()).rejects.toThrow();
    });
  });

  describe('findOne()', () => {
    it('returns the persisted quote by id', async () => {
      await seedQuote();

      const found = await ctx.runInCls(() => ctx.repo.findOne('qt_test_1'));

      expect(found.id).toBe('qt_test_1');
      expect(found.cryptoAmount).toBe('100.000000000000000000');
    });

    it('throws QuoteNotFoundException for an unknown id', async () => {
      await expect(
        ctx.runInCls(() => ctx.repo.findOne('qt_missing')),
      ).rejects.toThrow(QuoteNotFoundException);
    });
  });

  describe('update()', () => {
    it('updates fields and returns the updated row', async () => {
      await seedQuote();
      const consumedAt = new Date('2026-05-11T12:30:00Z');

      const updated = await ctx.runInCls(() =>
        ctx.repo.update('qt_test_1', { consumedAt }),
      );

      expect(updated.consumedAt).toEqual(consumedAt);
    });

    it('throws QuoteNotFoundException when updating an unknown id', async () => {
      await expect(
        ctx.runInCls(() =>
          ctx.repo.update('qt_missing', { consumedAt: new Date() }),
        ),
      ).rejects.toThrow(QuoteNotFoundException);
    });
  });
});
