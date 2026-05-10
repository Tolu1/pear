import { pgTable, varchar, decimal, timestamp } from 'drizzle-orm/pg-core';

export const quotes = pgTable('quotes', {
  id: varchar({ length: 50 }).primaryKey(),
  amount: decimal({ precision: 18, scale: 4 }).notNull(),
  currency: varchar({ length: 3 }).notNull(),
  cryptoAmount: decimal({ precision: 30, scale: 18 }).notNull(),
  rate: decimal({ precision: 30, scale: 18 }).notNull(),
  tokenId: varchar({ length: 20 }).notNull(),
  network: varchar({ length: 20 }).notNull(),
  expiresAt: timestamp().notNull(),
  consumedAt: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
});
