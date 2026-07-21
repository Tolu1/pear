import { Module } from '@nestjs/common';
import { BetaAccessController } from './beta-access.controller';
import { BetaAccessService } from './beta-access.service';
import { BetaAccessRepository } from './beta-access.repository';

@Module({
  controllers: [BetaAccessController],
  providers: [BetaAccessService, BetaAccessRepository],
  exports: [BetaAccessService],
})
export class BetaAccessModule {}
