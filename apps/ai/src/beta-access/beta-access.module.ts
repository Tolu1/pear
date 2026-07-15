import { Module } from '@nestjs/common';
import { BetaAccessService } from './beta-access.service';
import { BetaAccessController } from './beta-access.controller';

@Module({
  providers: [BetaAccessService],
  controllers: [BetaAccessController],
  exports: [BetaAccessService],
})
export class BetaAccessModule {}
