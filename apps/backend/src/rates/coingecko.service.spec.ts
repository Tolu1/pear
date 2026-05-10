import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CoinGeckoService } from './coingecko.service';

describe('CoinGeckoService', () => {
  let service: CoinGeckoService;
  let cache: { get: jest.Mock; set: jest.Mock };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-coingecko-api-key'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    cache = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoinGeckoService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    service = module.get<CoinGeckoService>(CoinGeckoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch price from CoinGecko API on cache miss', async () => {
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
    expect(cache.set).toHaveBeenCalledWith('coingecko:usd-coin:usd', '0.37');
  });

  it('should return cached price without calling API', async () => {
    cache.get.mockResolvedValueOnce('0.37');
    global.fetch = jest.fn();

    const result = await service.getPrice('usd-coin', 'USD');

    expect(result).toBe('0.37');
    expect(fetch).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
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
