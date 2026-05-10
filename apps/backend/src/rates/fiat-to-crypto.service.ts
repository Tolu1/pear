import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { CoinGeckoService } from './coingecko.service';
import { TokensService } from '../tokens/tokens.service';
import { type CurrencyCode } from '../common/constants/supported-currencies.contant';

@Injectable()
export class FiatToCryptoService {
  constructor(
    private readonly coinGecko: CoinGeckoService,
    private readonly tokensService: TokensService,
  ) {}

  async convert(
    amount: string,
    currencyCode: CurrencyCode,
    tokenId: string,
  ): Promise<{ cryptoAmount: string; rate: string }> {
    const { coingeckoId } = this.tokensService.findOne(tokenId);
    const rate = await this.coinGecko.getPrice(coingeckoId, currencyCode);
    const cryptoAmount = new Decimal(amount).dividedBy(rate).toString();
    return { cryptoAmount, rate };
  }
}
