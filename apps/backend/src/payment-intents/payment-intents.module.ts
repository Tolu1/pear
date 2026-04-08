import { Module } from '@nestjs/common';
import { PaymentIntentsService } from './payment-intents.service';
import { PaymentIntentsController } from './payment-intents.controller';
import { PaymentIntentsRepository } from './payment-intents.repository';
import { DrizzleModule } from '../database/drizzle.module';
import { QuotesModule } from '../quotes/quotes.module';
import { VirtualCardModule } from '../virtual-card/virtual-card.module';

@Module({
  imports: [DrizzleModule, QuotesModule, VirtualCardModule],
  controllers: [PaymentIntentsController],
  providers: [PaymentIntentsService, PaymentIntentsRepository],
  exports: [PaymentIntentsService],
})
export class PaymentIntentsModule {}
