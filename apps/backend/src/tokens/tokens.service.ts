import { Injectable } from '@nestjs/common';
import { TokensRepository } from './tokens.repository';
import { Token } from './interfaces/token.interface';
import { TokenRail } from './interfaces/token-rail.interface';
import { TokenRailNotSupportedException } from './exceptions/token-rail-not-supported.exception';

@Injectable()
export class TokensService {
  constructor(private readonly tokensRepository: TokensRepository) {}

  findAll(): Token[] {
    return this.tokensRepository.findAll();
  }

  findOne(id: string): Token {
    return this.tokensRepository.findOne(id);
  }

  findRail(token: Token, network: string): TokenRail {
    const rail = token.rails.find((r) => r.network === network);
    if (!rail) throw new TokenRailNotSupportedException();
    return rail;
  }

  assertRailSupport(tokenId: string, network: string): void {
    const token = this.findOne(tokenId);
    this.findRail(token, network);
  }
}
