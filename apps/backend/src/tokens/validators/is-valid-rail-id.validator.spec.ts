import { IsValidRailIdConstraint } from './is-valid-rail-id.validator';
import { TokensService } from '../tokens.service';
import { TokenRailNotSupportedException } from '../exceptions/token-rail-not-supported.exception';
import { createMock, DeepMocked } from '../../../test/utils/create-mock';
import { makeTokenRail } from '../../../test/factories';

describe('IsValidRailIdConstraint', () => {
  let constraint: IsValidRailIdConstraint;
  let tokensService: DeepMocked<TokensService>;

  beforeEach(() => {
    tokensService = createMock<TokensService>();
    constraint = new IsValidRailIdConstraint(tokensService);
  });

  describe('validate()', () => {
    it('returns true when the rail id resolves', () => {
      tokensService.findRail.mockReturnValue(makeTokenRail());

      expect(constraint.validate('usdc-base')).toBe(true);
      expect(tokensService.findRail).toHaveBeenCalledWith('usdc-base');
    });

    it('returns false when the rail lookup throws', () => {
      tokensService.findRail.mockImplementation(() => {
        throw new TokenRailNotSupportedException();
      });

      expect(constraint.validate('unknown-rail')).toBe(false);
    });

    it('returns false for non-string input', () => {
      expect(constraint.validate(42)).toBe(false);
      expect(constraint.validate({})).toBe(false);
      expect(tokensService.findRail).not.toHaveBeenCalled();
    });
  });

  describe('defaultMessage()', () => {
    it('produces a property-specific validation message', () => {
      const message = constraint.defaultMessage({
        property: 'railId',
        value: 'unknown',
      } as never);

      expect(message).toBe("railId 'unknown' is not a supported rail");
    });
  });
});
