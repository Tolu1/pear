import {
  pgTable,
  varchar,
  decimal,
  timestamp,
  pgEnum,
  jsonb,
} from 'drizzle-orm/pg-core';

export const paymentIntentStatusEnum = pgEnum('payment_intent_status', [
  'requires_transfer',
  'processing',
  'succeeded',
  'canceled',
  'expired',
]);

export const paymentIntents = pgTable('payment_intents', {
  id: varchar({ length: 50 }).primaryKey(),
  quoteId: varchar({ length: 50 }).notNull().unique(),
  status: paymentIntentStatusEnum().notNull().default('requires_transfer'),
  amount: decimal({ precision: 18, scale: 4 }).notNull(),
  currency: varchar({ length: 3 }).notNull(),
  cryptoAmount: decimal({ precision: 30, scale: 18 }).notNull(),
  tokenId: varchar({ length: 20 }).notNull(),
  blockchain: varchar({ length: 20 }).notNull(),
  paymentAddress: varchar({ length: 42 }).notNull(),
  fromAddress: varchar({ length: 42 }).notNull(),
  merchantDomain: varchar({ length: 255 }).notNull(),
  metadata: jsonb(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
