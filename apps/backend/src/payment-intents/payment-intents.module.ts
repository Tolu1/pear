import { Module } from '@nestjs/common';
import { PaymentIntentsService } from './payment-intents.service';
import { PaymentIntentsController } from './payment-intents.controller';
import { PaymentIntentsRepository } from './payment-intents.repository';
import { QuotesModule } from '../quotes/quotes.module';
import { VirtualCardModule } from '../virtual-card/virtual-card.module';
import { TokensModule } from '../tokens/tokens.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [QuotesModule, VirtualCardModule, TokensModule, BlockchainModule],
  controllers: [PaymentIntentsController],
  providers: [PaymentIntentsService, PaymentIntentsRepository],
  exports: [PaymentIntentsService],
})
export class PaymentIntentsModule {}
