import {
  pgTable,
  uuid,
  varchar,
  decimal,
  timestamp,
  text,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const paymentStatusEnum = pgEnum('payment_status', [
  'created',
  'awaiting_crypto_payment',
  'processing_fiat_payment',
  'completed',
  'failed',
]);

export const payments = pgTable('payments', {
  id: uuid().defaultRandom().primaryKey(),
  domain: varchar({ length: 255 }).notNull(),
  paymentUrl: text().notNull(),
  amount: decimal({ precision: 10, scale: 2 }).notNull(),
  currencyCode: varchar({ length: 3 }).notNull(),
  tokenId: varchar({ length: 20 }).notNull(),
  tokenAmount: decimal({ precision: 20, scale: 8 }).notNull(),
  from: varchar({ length: 42 }).notNull(),
  status: paymentStatusEnum().notNull().default('created'),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
