import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { coins } from './coins';
import type { CurrencyCode } from 'src/common/constants/supported-currencies.contant';
import type { TokenId } from 'src/common/constants/supported-tokens.constant';
import Decimal from 'decimal.js';
import { type CoinGeckoApiResponse } from './interfaces/coingecko-api-response.interface';

type SupportedFiat = CurrencyCode;
type SupportedCrypto = TokenId;

@Injectable()
export class ExchangeRateService {
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';

  constructor(private configService: ConfigService) {}

  async convert(
    amount: string,
    from: SupportedFiat,
    to: SupportedCrypto,
  ): Promise<string> {
    const rate = await this.getRate(from, to);
    const amountDecimal = new Decimal(amount);
    const rateDecimal = new Decimal(rate);

    return amountDecimal.dividedBy(rateDecimal).toString();
  }

  async getRate(from: SupportedFiat, to: SupportedCrypto): Promise<string> {
    const apiKey = this.configService.get<string>('COINGECKO_API_KEY');
    const coinId = this.getCoinId(to);
    const url = `${this.baseUrl}/coins/${coinId}?market_data=true&localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        ...(apiKey && { 'x-cg-demo-api-key': apiKey }),
      },
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(
        `CoinGecko API returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = (await response.json()) as CoinGeckoApiResponse;
    const price = data.market_data.current_price[from];

    if (!price) {
      throw new Error(`Price not available for ${to} in ${from}`);
    }

    return price.toString();
  }

  private getCoinId(currency: SupportedCrypto): string {
    const coin = coins.find((c) => c.id === currency);
    if (!coin) {
      throw new Error(`Unsupported crypto: ${currency}`);
    }
    return coin.id;
  }
}
