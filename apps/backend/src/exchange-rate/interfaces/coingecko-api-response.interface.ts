export interface CoinGeckoApiResponse {
  market_data: {
    current_price: Record<string, number>;
  };
}
