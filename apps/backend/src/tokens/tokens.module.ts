import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensRepository } from './tokens.repository';
import { IsValidTokenIdConstraint } from './validators/is-valid-token-id.validator';
import { IsValidNetworkForTokenConstraint } from './validators/is-valid-network-for-token.validator';

@Module({
  providers: [
    TokensService,
    TokensRepository,
    IsValidTokenIdConstraint,
    IsValidNetworkForTokenConstraint,
  ],
  exports: [TokensService],
})
export class TokensModule {}
