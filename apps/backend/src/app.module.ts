import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterDrizzleOrm } from '@nestjs-cls/transactional-adapter-drizzle-orm';
import Joi from 'joi';
import { HealthController } from './health/health.controller';
import { DrizzleModule, DRIZZLE } from './drizzle/drizzle.module';
import { TokensModule } from './tokens/tokens.module';
import { QuotesModule } from './quotes/quotes.module';
import { PaymentIntentsModule } from './payment-intents/payment-intents.module';
import { VirtualCardModule } from './virtual-card/virtual-card.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { BetaAccessModule } from './beta-access/beta-access.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        COINGECKO_API_KEY: Joi.string().required(),
        SERVICE_API_KEY: Joi.string().required(),
        ARC_RAIL_WALLET_PRIVATE_KEY: Joi.string().required(),
        DEMO_CARD_ID: Joi.string().allow('').optional(),
      }),
    }),
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
    TokensModule,
    QuotesModule,
    PaymentIntentsModule,
    VirtualCardModule,
    BlockchainModule,
    BetaAccessModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
