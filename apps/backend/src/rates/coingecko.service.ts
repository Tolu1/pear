import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type CoinGeckoApiResponse } from './interfaces/coingecko-api-response.interface';

@Injectable()
export class CoinGeckoService {
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';

  constructor(private readonly configService: ConfigService) {}

  async getPrice(coinId: string, currencyCode: string): Promise<string> {
    const apiKey = this.configService.get<string>('COINGECKO_API_KEY');
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
    const price = data.market_data.current_price[currencyCode.toLowerCase()];

    if (!price) {
      throw new Error(`Price not available for ${coinId} in ${currencyCode}`);
    }

    return price.toString();
  }
}
