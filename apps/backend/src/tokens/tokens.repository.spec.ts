import { TokensRepository } from './tokens.repository';
import { TokenNotFoundException } from './exceptions/token-not-found.exception';
import { TokenRailNotSupportedException } from './exceptions/token-rail-not-supported.exception';
import { tokens } from './tokens.constant';

describe('TokensRepository', () => {
  const repo = new TokensRepository();

  describe('findAll()', () => {
    it('returns the full token catalogue', () => {
      expect(repo.findAll()).toBe(tokens);
    });
  });

  describe('findOne()', () => {
    it('returns the token with the matching id', () => {
      const token = repo.findOne('usd-coin');

      expect(token.id).toBe('usd-coin');
      expect(token.symbol).toBe('USDC');
    });

    it('throws TokenNotFoundException for an unknown token id', () => {
      expect(() => repo.findOne('does-not-exist')).toThrow(
        TokenNotFoundException,
      );
    });
  });

  describe('findRail()', () => {
    it('returns the rail with the matching id across all tokens', () => {
      const rail = repo.findRail('usdc-base');

      expect(rail.id).toBe('usdc-base');
      expect(rail.tokenId).toBe('usd-coin');
      expect(rail.network).toBe('base');
    });

    it('throws TokenRailNotSupportedException for an unknown rail id', () => {
      expect(() => repo.findRail('does-not-exist')).toThrow(
        TokenRailNotSupportedException,
      );
    });
  });
});
