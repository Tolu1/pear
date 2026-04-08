import { Module } from '@nestjs/common';
import { PaymentIntentsService } from './payment-intents.service';
import { PaymentIntentsController } from './payment-intents.controller';
import { PaymentIntentsRepository } from './payment-intents.repository';
import { DrizzleModule } from '../database/drizzle.module';
import { QuotesModule } from '../quotes/quotes.module';

@Module({
  imports: [DrizzleModule, QuotesModule],
  controllers: [PaymentIntentsController],
  providers: [PaymentIntentsService, PaymentIntentsRepository],
  exports: [PaymentIntentsService],
})
export class PaymentIntentsModule {}
