import { Injectable } from '@nestjs/common';
import { TokensRepository } from './tokens.repository';
import { Token } from './interfaces/token.interface';
import { TokenRail } from './interfaces/token-rail.interface';

@Injectable()
export class TokensService {
  constructor(private readonly tokensRepository: TokensRepository) {}

  findAll(): Token[] {
    return this.tokensRepository.findAll();
  }

  findOne(id: string): Token {
    return this.tokensRepository.findOne(id);
  }

  findRail(railId: string): TokenRail {
    return this.tokensRepository.findRail(railId);
  }
}
