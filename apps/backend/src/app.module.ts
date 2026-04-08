import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './database/drizzle.module';
import { TokensModule } from './tokens/tokens.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { QuotesModule } from './quotes/quotes.module';
import { PaymentIntentsModule } from './payment-intents/payment-intents.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DrizzleModule,
    TokensModule,
    WebhooksModule,
    QuotesModule,
    PaymentIntentsModule,
  ],
})
export class AppModule {}
