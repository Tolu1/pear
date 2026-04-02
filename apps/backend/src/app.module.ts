import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { PaymentsModule } from './payments/payments.module';
import { TokensModule } from './tokens/tokens.module';
import { AdaptersModule } from './adapters/adapters.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    PaymentsModule,
    TokensModule,
    AdaptersModule,
    WebhooksModule,
  ],
})
export class AppModule {}
