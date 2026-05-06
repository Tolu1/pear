import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterDrizzleOrm } from '@nestjs-cls/transactional-adapter-drizzle-orm';
import Joi from 'joi';
import { HealthController } from './health/health.controller';
import { DrizzleModule, DRIZZLE } from './drizzle/drizzle.module';
import { TokensModule } from './tokens/tokens.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { QuotesModule } from './quotes/quotes.module';
import { PaymentIntentsModule } from './payment-intents/payment-intents.module';
import { VirtualCardModule } from './virtual-card/virtual-card.module';

const evmAddress = Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        COINGECKO_API_KEY: Joi.string().required(),
        MORALIS_API_KEY: Joi.string().required(),
        MORALIS_STREAM_SECRET: Joi.string().required(),
        PAYMENT_ADDRESS_LISK: evmAddress.required(),
        PAYMENT_ADDRESS_SAFE: evmAddress.required(),
        CARD_NUMBER: Joi.string().required(),
        CARD_EXPIRY: Joi.string().required(),
        CARD_CVV: Joi.string().required(),
        CARD_NAME: Joi.string().required(),
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
    WebhooksModule,
    QuotesModule,
    PaymentIntentsModule,
    VirtualCardModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
