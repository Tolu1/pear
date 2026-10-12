import { faker } from '@faker-js/faker';
import type { PaymentIntent } from '../../src/payment-intents/interfaces/payment-intent.interface';
import { PaymentIntentStatus } from '../../src/payment-intents/enums/payment-intent-status.enum';
import { makeAddress } from './address.factory';
import { makeQuote } from './quote.factory';
import { makeTokenRail } from './token.factory';

export function makePaymentIntent(
  overrides: Partial<PaymentIntent> = {},
): PaymentIntent {
  const createdAt = overrides.createdAt ?? new Date();
  const expiresAt =
    overrides.expiresAt ?? new Date(createdAt.getTime() + 5 * 60_000);

  return {
    id: faker.string.uuid(),
    status: PaymentIntentStatus.REQUIRES_TRANSFER,
    fromAddress: makeAddress(),
    merchantDomain: 'temu.com',
    metadata: null,
    txHash: null,
    cardId: null,
    expiresAt,
    createdAt,
    updatedAt: createdAt,
    quote: makeQuote(),
    rail: makeTokenRail(),
    ...overrides,
  };
}
