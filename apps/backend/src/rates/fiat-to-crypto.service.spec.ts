import { Test } from '@nestjs/testing';
import { CoinGeckoService } from './coingecko.service';
import { FiatToCryptoService } from './fiat-to-crypto.service';
import { TokensService } from '../tokens/tokens.service';
import { TokenNotFoundException } from '../tokens/exceptions/token-not-found.exception';
import { createMock, DeepMocked } from '../../test/utils/create-mock';
import { makeToken } from '../../test/factories';

describe('FiatToCryptoService', () => {
  let service: FiatToCryptoService;
  let coinGecko: DeepMocked<CoinGeckoService>;
  let tokensService: DeepMocked<TokensService>;

  beforeEach(async () => {
    coinGecko = createMock<CoinGeckoService>();
    tokensService = createMock<TokensService>();

    const moduleRef = await Test.createTestingModule({
      providers: [
        FiatToCryptoService,
        { provide: CoinGeckoService, useValue: coinGecko },
        { provide: TokensService, useValue: tokensService },
      ],
    }).compile();

    service = moduleRef.get(FiatToCryptoService);
  });

  describe('convert()', () => {
    it('returns rate and crypto amount derived from the CoinGecko price', async () => {
      tokensService.findOne.mockReturnValue(
        makeToken({ coingeckoId: 'usd-coin' }),
      );
      coinGecko.getPrice.mockResolvedValue('0.37');

      const result = await service.convert('1000', 'USD', 'usd-coin');

      expect(result.rate).toBe('0.37');
      expect(parseFloat(result.cryptoAmount)).toBeCloseTo(2702.7, 2);
    });

    it('looks up the token via the token id, not the coingecko id', async () => {
      tokensService.findOne.mockReturnValue(makeToken({ coingeckoId: 'dai' }));
      coinGecko.getPrice.mockResolvedValue('1.00');

      await service.convert('10', 'USD', 'maker-dai');

      expect(tokensService.findOne).toHaveBeenCalledWith('maker-dai');
      expect(coinGecko.getPrice).toHaveBeenCalledWith('dai', 'USD');
    });

    it('propagates TokenNotFoundException without calling CoinGecko', async () => {
      tokensService.findOne.mockImplementation(() => {
        throw new TokenNotFoundException();
      });

      await expect(service.convert('1000', 'USD', 'unknown')).rejects.toThrow(
        TokenNotFoundException,
      );
      expect(coinGecko.getPrice).not.toHaveBeenCalled();
    });
  });
});
