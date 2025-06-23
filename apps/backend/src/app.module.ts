import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { PaymentsModule } from './payments/payments.module';
import { ExchangeRateService } from './exchange-rate/exchange-rate.service';
import { BlockchainModule } from './blockchain/blockchain.module';
import { TokensModule } from './tokens/tokens.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    PaymentsModule,
    BlockchainModule,
    TokensModule,
  ],
  providers: [ExchangeRateService],
})
export class AppModule {}
