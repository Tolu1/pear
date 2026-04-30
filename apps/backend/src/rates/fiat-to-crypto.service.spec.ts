import { Test, TestingModule } from '@nestjs/testing';
import { CoinGeckoService } from './coingecko.service';
import { FiatToCryptoService } from './fiat-to-crypto.service';
import { UnsupportedTokenException } from './exceptions/unsupported-token.exception';
import { type TokenId } from '../common/constants/supported-tokens.constant';

describe('FiatToCryptoService', () => {
  let service: FiatToCryptoService;
  let coinGecko: jest.Mocked<CoinGeckoService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FiatToCryptoService,
        {
          provide: CoinGeckoService,
          useValue: {
            getPrice: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FiatToCryptoService>(FiatToCryptoService);
    coinGecko = module.get(CoinGeckoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should convert fiat to crypto and return rate and amount', async () => {
    coinGecko.getPrice.mockResolvedValue('0.37');

    const result = await service.convert('1000', 'USD', 'usd-coin');

    expect(coinGecko.getPrice).toHaveBeenCalledWith('usd-coin', 'USD');
    expect(result.rate).toBe('0.37');
    expect(parseFloat(result.cryptoAmount)).toBeCloseTo(2702.7, 2);
  });

  it('should throw UnsupportedTokenException for unknown token', async () => {
    await expect(
      service.convert('1000', 'USD', 'fake-token' as TokenId),
    ).rejects.toThrow(UnsupportedTokenException);
    expect(coinGecko.getPrice).not.toHaveBeenCalled();
  });
});
