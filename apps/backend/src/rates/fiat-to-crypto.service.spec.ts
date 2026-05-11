import { Test, TestingModule } from '@nestjs/testing';
import { CoinGeckoService } from './coingecko.service';
import { FiatToCryptoService } from './fiat-to-crypto.service';
import { TokensService } from '../tokens/tokens.service';
import { TokenNotFoundException } from '../tokens/exceptions/token-not-found.exception';

describe('FiatToCryptoService', () => {
  let service: FiatToCryptoService;
  let coinGecko: jest.Mocked<CoinGeckoService>;
  let tokensService: jest.Mocked<TokensService>;

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
        {
          provide: TokensService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FiatToCryptoService>(FiatToCryptoService);
    coinGecko = module.get(CoinGeckoService);
    tokensService = module.get(TokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should convert fiat to crypto and return rate and amount', async () => {
    tokensService.findOne.mockReturnValue({
      id: 'usd-coin',
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
      coingeckoId: 'usd-coin',
      rails: [],
    });
    coinGecko.getPrice.mockResolvedValue('0.37');

    const result = await service.convert('1000', 'USD', 'usd-coin');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(tokensService.findOne).toHaveBeenCalledWith('usd-coin');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(coinGecko.getPrice).toHaveBeenCalledWith('usd-coin', 'USD');
    expect(result.rate).toBe('0.37');
    expect(parseFloat(result.cryptoAmount)).toBeCloseTo(2702.7, 2);
  });

  it('should throw TokenNotFoundException for unknown token', async () => {
    tokensService.findOne.mockImplementation(() => {
      throw new TokenNotFoundException();
    });

    await expect(service.convert('1000', 'USD', 'fake-token')).rejects.toThrow(
      TokenNotFoundException,
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(coinGecko.getPrice).not.toHaveBeenCalled();
  });
});
