import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CoinGeckoService } from './coingecko.service';

describe('CoinGeckoService', () => {
  let service: CoinGeckoService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-coingecko-api-key'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [CoinGeckoService, ConfigService],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    service = module.get<CoinGeckoService>(CoinGeckoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch price from CoinGecko API', async () => {
    const mockResponse = {
      market_data: {
        current_price: {
          usd: 0.37,
        },
      },
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as unknown as Response);

    const result = await service.getPrice('usd-coin', 'USD');

    expect(result).toBe('0.37');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://api.coingecko.com/api/v3/coins/usd-coin',
      ),
      expect.objectContaining({
        method: 'GET',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        headers: expect.objectContaining({
          accept: 'application/json',
          'x-cg-demo-api-key': 'mock-coingecko-api-key',
        }),
      }),
    );
  });

  it('should throw if price is not available for the currency', async () => {
    const mockResponse = {
      market_data: {
        current_price: {
          eur: 0.35,
        },
      },
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as unknown as Response);

    await expect(service.getPrice('usd-coin', 'USD')).rejects.toThrow(
      'Price not available for usd-coin in USD',
    );
  });

  it('should throw on API error', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    await expect(service.getPrice('usd-coin', 'USD')).rejects.toThrow(
      'CoinGecko API returned 404: Not Found',
    );
  });
});
