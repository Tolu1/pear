import {
  pgTable,
  varchar,
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
  railId: varchar({ length: 50 }).notNull(),
  status: paymentIntentStatusEnum().notNull().default('requires_transfer'),
  fromAddress: varchar({ length: 42 }).notNull(),
  merchantDomain: varchar({ length: 255 }).notNull(),
  metadata: jsonb(),
  txHash: varchar({ length: 66 }).unique(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
