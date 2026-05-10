import { Injectable } from '@nestjs/common';
import { tokens } from './tokens.constant';
import { Token, TokenNetwork } from './interfaces/token.interface';
import { TokenNotFoundException } from './exceptions/token-not-found.exception';

@Injectable()
export class TokensService {
  findOne(id: string): Token {
    const token = tokens[id];
    if (!token) throw new TokenNotFoundException();

    const networks = Object.fromEntries(
      token.networks.map(({ network, ...rest }): [string, TokenNetwork] => [
        network,
        rest,
      ]),
    );

    return {
      id,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      coingeckoId: token.coingeckoId,
      networks,
    };
  }
}
