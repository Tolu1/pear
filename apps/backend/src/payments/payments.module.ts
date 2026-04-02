import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DatabaseModule } from '../database/database.module';
import { PaymentsEventsService } from './payments-events.service';
import { AdaptersModule } from '../adapters/adapters.module';
import { ExchangeRateModule } from '../exchange-rate/exchange-rate.module';

@Module({
  imports: [DatabaseModule, AdaptersModule, ExchangeRateModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsEventsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
