import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule, ClsService } from 'nestjs-cls';
import {
  ClsPluginTransactional,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterDrizzleOrm } from '@nestjs-cls/transactional-adapter-drizzle-orm';
import { DrizzleModule, DRIZZLE } from '../../src/drizzle/drizzle.module';
import { PaymentIntentsService } from '../../src/payment-intents/payment-intents.service';
import { PaymentIntentsRepository } from '../../src/payment-intents/payment-intents.repository';
import { PaymentIntentConflictException } from '../../src/payment-intents/exceptions/payment-intent-conflict.exception';
import { QuotesService } from '../../src/quotes/quotes.service';
import { QuotesRepository } from '../../src/quotes/quotes.repository';
import { TokensService } from '../../src/tokens/tokens.service';
import { TokensRepository } from '../../src/tokens/tokens.repository';
import { BlockchainService } from '../../src/blockchain/blockchain.service';
import { VirtualCardService } from '../../src/virtual-card/virtual-card.service';
import { createMock, DeepMocked } from '../utils/create-mock';
import type { TestDatabase } from '../utils/postgres-container';
import { truncateAll } from '../utils/truncate';
import { makeAddress, makeQuote, makeTxHash } from '../factories';

const testDb = (): TestDatabase =>
  (globalThis as Record<string, unknown>).__TEST_DB__ as TestDatabase;

describe('PaymentIntentsService (integration)', () => {
  let moduleRef: TestingModule;
  let service: PaymentIntentsService;
  let cls: ClsService;
  let txHost: TransactionHost;
  let intentsRepository: PaymentIntentsRepository;
  let quotesRepository: QuotesRepository;
  let quotesService: DeepMocked<QuotesService>;
  let virtualCardService: DeepMocked<VirtualCardService>;

  beforeAll(async () => {
    quotesService = createMock<QuotesService>();
    virtualCardService = createMock<VirtualCardService>();

    moduleRef = await Test.createTestingModule({
      imports: [
        ClsModule.forRoot({
          plugins: [
            new ClsPluginTransactional({
              imports: [DrizzleModule],
              adapter: new TransactionalAdapterDrizzleOrm({
                drizzleInstanceToken: DRIZZLE,
              }),
            }),
          ],
        }),
      ],
      providers: [
        PaymentIntentsService,
        PaymentIntentsRepository,
        QuotesRepository,
        TokensService,
        TokensRepository,
        { provide: QuotesService, useValue: quotesService },
        { provide: VirtualCardService, useValue: virtualCardService },
        {
          provide: BlockchainService,
          useValue: createMock<BlockchainService>(),
        },
      ],
    })
      .overrideProvider(DRIZZLE)
      .useValue(testDb().db)
      .compile();

    await moduleRef.init();

    service = moduleRef.get(PaymentIntentsService);
    cls = moduleRef.get(ClsService);
    txHost = moduleRef.get(TransactionHost);
    intentsRepository = moduleRef.get(PaymentIntentsRepository);
    quotesRepository = moduleRef.get(QuotesRepository);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(async () => {
    await truncateAll(testDb().db);
  });

  describe('submit()', () => {
    it('buys exactly one card when two submits race for the same intent', async () => {
      const quote = makeQuote({ id: 'qt_race' });
      quotesService.findOne.mockResolvedValue(quote);
      virtualCardService.issue.mockResolvedValue('card_123');

      await cls.run(async () => {
        await quotesRepository.create({
          id: quote.id,
          amount: quote.amount,
          currencyCode: quote.currencyCode,
          cardFee: quote.cardFee,
          cryptoAmount: quote.cryptoAmount,
          rate: quote.rate,
          tokenId: quote.tokenId,
          expiresAt: quote.expiresAt,
        });
        await intentsRepository.create({
          id: 'pi_race',
          quoteId: quote.id,
          railId: 'usdc-base',
          fromAddress: makeAddress(),
          merchantDomain: 'temu.com',
          expiresAt: new Date(Date.now() + 60_000),
        });
      });

      // Hold each transactional read until both submits have made one, so
      // both see requires_transfer before either writes.
      const findOne = intentsRepository.findOne.bind(intentsRepository);
      let transactionalReads = 0;
      let releaseReads!: () => void;
      const bothRead = new Promise<void>((resolve) => (releaseReads = resolve));
      jest
        .spyOn(intentsRepository, 'findOne')
        .mockImplementation(async (id) => {
          const row = await findOne(id);
          if (!txHost.isTransactionActive()) return row;
          transactionalReads += 1;
          if (transactionalReads === 2) releaseReads();
          await bothRead;
          return row;
        });

      const txHash = makeTxHash();
      const results = await Promise.allSettled([
        cls.run(() => service.submit('pi_race', txHash)),
        cls.run(() => service.submit('pi_race', txHash)),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');
      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);
      expect(rejected[0].reason).toBeInstanceOf(PaymentIntentConflictException);
      expect(virtualCardService.issue).toHaveBeenCalledTimes(1);
    });
  });
});
