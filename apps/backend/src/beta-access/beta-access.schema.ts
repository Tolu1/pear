import { pgTable, varchar, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const betaAccess = pgTable('beta_access', {
  code: varchar({ length: 20 }).primaryKey(),
  email: varchar({ length: 255 }).notNull(),
  runLimit: integer().notNull().default(25),
  runsUsed: integer().notNull().default(0),
  active: boolean().notNull().default(true),
  createdAt: timestamp().defaultNow().notNull(),
});
