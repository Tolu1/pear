import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { QuotesRepository } from './quotes.repository';
import { RatesModule } from '../rates/rates.module';
import { TokensModule } from '../tokens/tokens.module';

@Module({
  imports: [RatesModule, TokensModule],
  controllers: [QuotesController],
  providers: [QuotesService, QuotesRepository],
  exports: [QuotesService],
})
export class QuotesModule {}
