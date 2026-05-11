import { IsValidTokenIdConstraint } from './is-valid-token-id.validator';
import { TokensService } from '../tokens.service';
import { TokenNotFoundException } from '../exceptions/token-not-found.exception';
import { createMock, DeepMocked } from '../../../test/utils/create-mock';
import { makeToken } from '../../../test/factories';

describe('IsValidTokenIdConstraint', () => {
  let constraint: IsValidTokenIdConstraint;
  let tokensService: DeepMocked<TokensService>;

  beforeEach(() => {
    tokensService = createMock<TokensService>();
    constraint = new IsValidTokenIdConstraint(tokensService);
  });

  describe('validate()', () => {
    it('returns true when the token id resolves', () => {
      tokensService.findOne.mockReturnValue(makeToken());

      expect(constraint.validate('usd-coin')).toBe(true);
      expect(tokensService.findOne).toHaveBeenCalledWith('usd-coin');
    });

    it('returns false when the token lookup throws', () => {
      tokensService.findOne.mockImplementation(() => {
        throw new TokenNotFoundException();
      });

      expect(constraint.validate('unknown')).toBe(false);
    });

    it('returns false for non-string input without calling the service', () => {
      expect(constraint.validate(123)).toBe(false);
      expect(constraint.validate(undefined)).toBe(false);
      expect(constraint.validate(null)).toBe(false);
      expect(tokensService.findOne).not.toHaveBeenCalled();
    });
  });

  describe('defaultMessage()', () => {
    it('produces a property-specific validation message', () => {
      const message = constraint.defaultMessage({
        property: 'tokenId',
        value: 'unknown',
      } as never);

      expect(message).toBe("tokenId 'unknown' is not a supported token");
    });
  });
});
