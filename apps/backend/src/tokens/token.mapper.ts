import { Token } from './interfaces/token.interface';
import {
  TokenResponseDto,
  TokenRailResponseDto,
} from './dto/token-response.dto';

export class TokenMapper {
  static toResponse(this: void, token: Token): TokenResponseDto {
    return {
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      coingeckoId: token.coingeckoId,
      rails: token.rails.map(
        (rail): TokenRailResponseDto => ({
          network: rail.network,
          chainId: rail.chainId,
          tokenAddress: rail.tokenAddress,
          paymentAddress: rail.paymentAddress,
        }),
      ),
    };
  }
}
