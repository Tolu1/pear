import { faker } from '@faker-js/faker';
import { betaAccess } from '../../src/beta-access/beta-access.schema';
import { MAX_RUNS } from '../../src/beta-access/beta-access.constants';

type BetaAccess = typeof betaAccess.$inferSelect;

export function makeBetaAccess(overrides: Partial<BetaAccess> = {}): BetaAccess {
  return {
    code: 'PEAR-TEST',
    email: faker.internet.email(),
    runsGranted: MAX_RUNS,
    runsUsed: 0,
    active: true,
    createdAt: new Date(),
    ...overrides,
  };
}
