import { Injectable } from '@nestjs/common';
import { tokens } from './tokens.constant';
import { Token } from './interfaces/token.interface';
import { TokenRail } from './interfaces/token-rail.interface';
import { TokenNotFoundException } from './exceptions/token-not-found.exception';
import { TokenRailNotSupportedException } from './exceptions/token-rail-not-supported.exception';

@Injectable()
export class TokensRepository {
  findAll(): Token[] {
    return tokens;
  }

  findOne(id: string): Token {
    const token = tokens.find((t) => t.id === id);
    if (!token) throw new TokenNotFoundException();
    return token;
  }

  findRail(railId: string): TokenRail {
    const rail = tokens.flatMap((t) => t.rails).find((r) => r.id === railId);
    if (!rail) throw new TokenRailNotSupportedException();
    return rail;
  }
}
