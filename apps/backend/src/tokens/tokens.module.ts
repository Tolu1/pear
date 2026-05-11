import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensRepository } from './tokens.repository';
import { TokensController } from './tokens.controller';
import { IsValidTokenIdConstraint } from './validators/is-valid-token-id.validator';
import { IsValidNetworkForTokenConstraint } from './validators/is-valid-network-for-token.validator';

@Module({
  controllers: [TokensController],
  providers: [
    TokensService,
    TokensRepository,
    IsValidTokenIdConstraint,
    IsValidNetworkForTokenConstraint,
  ],
  exports: [TokensService],
})
export class TokensModule {}
