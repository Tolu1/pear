import { Injectable } from '@nestjs/common';
import { tokens } from './tokens.constant';
import { Token } from './interfaces/token.interface';
import { TokenNotFoundException } from './exceptions/token-not-found.exception';

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
}
