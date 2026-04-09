import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRateService } from './exchange-rate.service';
import { ConfigService } from '@nestjs/config';
import { TokenId } from 'src/common/constants/supported-tokens.constant';

describe('ExchangeRateService', () => {
  let service: ExchangeRateService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-coingecko-api-key'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ExchangeRateService, ConfigService],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    service = module.get<ExchangeRateService>(ExchangeRateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should convert fiat to crypto', async () => {
    const rate = '0.37';
    const getRateSpy = jest.spyOn(service, 'getRate').mockResolvedValue(rate);

    const result = await service.convert('1000', 'usd', 'usd-coin');
    expect(getRateSpy).toHaveBeenCalledWith('usd', 'usd-coin');
    expect(parseFloat(result)).toBeCloseTo(2702.7, 2);
  });

  it('should get exchange rate from CoinGecko API', async () => {
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

    const result = await service.getRate('usd', 'usd-coin');

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

  it('should throw an error if price is not available', async () => {
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

    await expect(service.getRate('usd', 'usd-coin')).rejects.toThrow(
      'Price not available for lisk in usd',
    );
  });

  it('should throw an error for unsupported token', async () => {
    await expect(
      service.getRate('usd', 'fake-token' as TokenId),
    ).rejects.toThrow('Unsupported crypto: fake-token');
  });

  it('should handle API errors gracefully', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    await expect(service.getRate('usd', 'usd-coin')).rejects.toThrow(
      'CoinGecko API returned 404: Not Found',
    );
  });
});
