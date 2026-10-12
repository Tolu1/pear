import { QuoteMapper } from './quote.mapper';

describe('QuoteMapper.toDomain()', () => {
  it('maps a quote row to a domain quote', () => {
    const row = {
      id: 'qt_1',
      amount: '100.00',
      currencyCode: 'USD',
      cardFee: '0',
      cryptoAmount: '100.000000',
      rate: '1.0',
      tokenId: 'usd-coin',
      expiresAt: new Date('2026-05-11T12:00:00Z'),
      consumedAt: null,
      createdAt: new Date('2026-05-11T11:45:00Z'),
    };

    expect(QuoteMapper.toDomain(row)).toEqual(row);
  });

  it('preserves consumedAt when set', () => {
    const consumedAt = new Date('2026-05-11T11:50:00Z');
    const row = {
      id: 'qt_2',
      amount: '50',
      currencyCode: 'USD',
      cardFee: '0',
      cryptoAmount: '50',
      rate: '1.0',
      tokenId: 'usd-coin',
      expiresAt: new Date('2026-05-11T12:00:00Z'),
      consumedAt,
      createdAt: new Date('2026-05-11T11:45:00Z'),
    };

    expect(QuoteMapper.toDomain(row).consumedAt).toBe(consumedAt);
  });
});
