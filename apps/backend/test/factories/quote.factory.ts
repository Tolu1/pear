import { faker } from '@faker-js/faker';
import type { Quote } from '../../src/quotes/interfaces/quote.interface';

export function makeQuote(overrides: Partial<Quote> = {}): Quote {
  const createdAt = overrides.createdAt ?? new Date();
  const expiresAt =
    overrides.expiresAt ?? new Date(createdAt.getTime() + 5 * 60_000);

  return {
    id: faker.string.uuid(),
    amount: '10.00',
    currencyCode: 'USD',
    cardFee: '0',
    cryptoAmount: '10.000000',
    rate: '1.0',
    tokenId: 'usd-coin',
    expiresAt,
    consumedAt: null,
    createdAt,
    ...overrides,
  };
}
