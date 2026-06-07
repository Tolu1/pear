import { Test } from '@nestjs/testing';
import { TokensService } from './tokens.service';
import { TokensRepository } from './tokens.repository';
import { TokenNotFoundException } from './exceptions/token-not-found.exception';
import { TokenRailNotSupportedException } from './exceptions/token-rail-not-supported.exception';
import { createMock, DeepMocked } from '../../test/utils/create-mock';
import { makeToken, makeTokenRail } from '../../test/factories';

describe('TokensService', () => {
  let service: TokensService;
  let repo: DeepMocked<TokensRepository>;

  beforeEach(async () => {
    repo = createMock<TokensRepository>();

    const moduleRef = await Test.createTestingModule({
      providers: [TokensService, { provide: TokensRepository, useValue: repo }],
    }).compile();

    service = moduleRef.get(TokensService);
  });

  describe('findAll()', () => {
    it('returns the catalogue from the repository', () => {
      const tokens = [makeToken(), makeToken({ id: 'dai' })];
      repo.findAll.mockReturnValue(tokens);

      expect(service.findAll()).toEqual(tokens);
    });
  });

  describe('findOne()', () => {
    it('returns the matching token', () => {
      const token = makeToken();
      repo.findOne.mockReturnValue(token);

      expect(service.findOne('usd-coin')).toEqual(token);
      expect(repo.findOne).toHaveBeenCalledWith('usd-coin');
    });

    it('propagates TokenNotFoundException from the repository', () => {
      repo.findOne.mockImplementation(() => {
        throw new TokenNotFoundException();
      });

      expect(() => service.findOne('unknown')).toThrow(TokenNotFoundException);
    });
  });

  describe('findRail()', () => {
    it('returns the matching rail', () => {
      const rail = makeTokenRail();
      repo.findRail.mockReturnValue(rail);

      expect(service.findRail('usdc-base')).toEqual(rail);
      expect(repo.findRail).toHaveBeenCalledWith('usdc-base');
    });

    it('propagates TokenRailNotSupportedException from the repository', () => {
      repo.findRail.mockImplementation(() => {
        throw new TokenRailNotSupportedException();
      });

      expect(() => service.findRail('unknown-rail')).toThrow(
        TokenRailNotSupportedException,
      );
    });
  });
});
