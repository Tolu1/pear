import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CoinGeckoService } from './coingecko.service';
import { createMock, DeepMocked } from '../../test/utils/create-mock';

describe('CoinGeckoService', () => {
  let service: CoinGeckoService;
  let cache: DeepMocked<Cache>;
  let configService: DeepMocked<ConfigService>;

  beforeEach(async () => {
    cache = createMock<Cache>();
    configService = createMock<ConfigService>();
    configService.get.mockReturnValue('test-coingecko-key');

    const moduleRef = await Test.createTestingModule({
      providers: [
        CoinGeckoService,
        { provide: ConfigService, useValue: configService },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    service = moduleRef.get(CoinGeckoService);
  });

  describe('getPrice()', () => {
    const okResponse = (price: Record<string, number>) =>
      ({
        ok: true,
        json: () => Promise.resolve({ market_data: { current_price: price } }),
      }) as unknown as Response;

    it('returns cached price without hitting CoinGecko', async () => {
      cache.get.mockResolvedValue('0.37');
      const fetchSpy = jest.spyOn(global, 'fetch');

      const result = await service.getPrice('usd-coin', 'USD');

      expect(result).toBe('0.37');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('fetches from CoinGecko and caches the result on cache miss', async () => {
      cache.get.mockResolvedValue(undefined);
      jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(okResponse({ usd: 0.37 }));

      const result = await service.getPrice('usd-coin', 'USD');

      expect(result).toBe('0.37');
      expect(cache.set).toHaveBeenCalledWith('coingecko:usd-coin:usd', '0.37');
    });

    it('sends the API key as a header when configured', async () => {
      cache.get.mockResolvedValue(undefined);
      const fetchSpy = jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(okResponse({ usd: 1 }));

      await service.getPrice('usd-coin', 'USD');

      const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/coins/usd-coin');
      expect(options.headers).toMatchObject({
        accept: 'application/json',
        'x-cg-demo-api-key': 'test-coingecko-key',
      });
    });

    it('throws when CoinGecko returns a non-OK status', async () => {
      cache.get.mockResolvedValue(undefined);
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(service.getPrice('usd-coin', 'USD')).rejects.toThrow(
        'CoinGecko API returned 404: Not Found',
      );
    });

    it('throws when the requested currency is missing from the response', async () => {
      cache.get.mockResolvedValue(undefined);
      jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(okResponse({ eur: 0.35 }));

      await expect(service.getPrice('usd-coin', 'USD')).rejects.toThrow(
        'Price not available for usd-coin in USD',
      );
    });
  });
});
