import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { CoinGeckoService } from './coingecko.service';
import { COINGECKO_ID_BY_TOKEN } from './coingecko-id.constants';
import { UnsupportedTokenException } from './exceptions/unsupported-token.exception';
import { type CurrencyCode } from '../common/constants/supported-currencies.contant';

@Injectable()
export class FiatToCryptoService {
  constructor(private readonly coinGecko: CoinGeckoService) {}

  async convert(
    amount: string,
    currencyCode: CurrencyCode,
    tokenId: string,
  ): Promise<{ cryptoAmount: string; rate: string }> {
    const rate = await this.getRate(currencyCode, tokenId);
    const cryptoAmount = new Decimal(amount).dividedBy(rate).toString();
    return { cryptoAmount, rate };
  }

  private async getRate(
    currencyCode: CurrencyCode,
    tokenId: string,
  ): Promise<string> {
    const coinId = COINGECKO_ID_BY_TOKEN[tokenId];
    if (!coinId) {
      throw new UnsupportedTokenException();
    }
    return this.coinGecko.getPrice(coinId, currencyCode);
  }
}
