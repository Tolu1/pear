import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { DrizzleModule } from './database/drizzle.module';
import { TokensModule } from './tokens/tokens.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { QuotesModule } from './quotes/quotes.module';
import { PaymentIntentsModule } from './payment-intents/payment-intents.module';
import { VirtualCardModule } from './virtual-card/virtual-card.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DrizzleModule,
    TokensModule,
    WebhooksModule,
    QuotesModule,
    PaymentIntentsModule,
    VirtualCardModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
