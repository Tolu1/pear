import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DatabaseModule } from '../database/database.module';
import { PaymentsEventsService } from './payments-events.service';
import { AdaptersModule } from '../adapters/adapters.module';

@Module({
  imports: [DatabaseModule, AdaptersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsEventsService],
})
export class PaymentsModule {}
