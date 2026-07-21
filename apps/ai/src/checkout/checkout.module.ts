import { Module } from '@nestjs/common';
import { AgentModule } from '../agent/agent.module';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { PaymentIntentsService } from './payment-intents.service';

@Module({
  imports: [AgentModule],
  controllers: [CheckoutController],
  providers: [CheckoutService, PaymentIntentsService],
})
export class CheckoutModule {}
