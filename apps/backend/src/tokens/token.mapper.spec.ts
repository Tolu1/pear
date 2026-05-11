import { TokenMapper } from './token.mapper';
import { makeToken, makeTokenRail } from '../../test/factories';

describe('TokenMapper.toResponse()', () => {
  it('projects a token to its response DTO with rails', () => {
    const rail = makeTokenRail({ confirmations: 5 });
    const token = makeToken({ rails: [rail] });

    const response = TokenMapper.toResponse(token);

    expect(response).toEqual({
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      coingeckoId: token.coingeckoId,
      rails: [
        {
          id: rail.id,
          tokenId: rail.tokenId,
          chainId: rail.chainId,
          network: rail.network,
          tokenAddress: rail.tokenAddress,
          paymentAddress: rail.paymentAddress,
        },
      ],
    });
  });

  it('omits the confirmations field from rail responses', () => {
    const token = makeToken({ rails: [makeTokenRail({ confirmations: 7 })] });

    const response = TokenMapper.toResponse(token);

    expect(response.rails[0]).not.toHaveProperty('confirmations');
  });
});
