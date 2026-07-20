import {
  pgTable,
  varchar,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { MAX_RUNS } from './beta-access.constants';

export const betaAccess = pgTable('beta_access', {
  code: varchar({ length: 20 }).primaryKey(),
  email: varchar({ length: 255 }).notNull(),
  runsGranted: integer().notNull().default(MAX_RUNS),
  runsUsed: integer().notNull().default(0),
  active: boolean().notNull().default(true),
  createdAt: timestamp().defaultNow().notNull(),
});
