import { faker } from '@faker-js/faker';
import { betaAccess } from '../../src/beta-access/beta-access.schema';

type BetaAccess = typeof betaAccess.$inferSelect;

export function makeBetaAccess(overrides: Partial<BetaAccess> = {}): BetaAccess {
  return {
    code: 'PEAR-TEST',
    email: faker.internet.email(),
    runLimit: 25,
    runsUsed: 0,
    active: true,
    createdAt: new Date(),
    ...overrides,
  };
}
