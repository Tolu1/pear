import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensRepository } from './tokens.repository';
import { TokensController } from './tokens.controller';
import { IsValidTokenIdConstraint } from './validators/is-valid-token-id.validator';
import { IsValidRailIdConstraint } from './validators/is-valid-rail-id.validator';

@Module({
  controllers: [TokensController],
  providers: [
    TokensService,
    TokensRepository,
    IsValidTokenIdConstraint,
    IsValidRailIdConstraint,
  ],
  exports: [TokensService],
})
export class TokensModule {}
