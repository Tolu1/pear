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
  merchantDomain: varchar({ length: 255 }).notNull(),
  paymentUrl: text().notNull(),
  from: varchar({ length: 42 }).notNull(),
  fiatAmount: decimal({ precision: 10, scale: 4 }).notNull(),
  fiatCurrencyCode: varchar({ length: 3 }).notNull(),
  tokenAmount: decimal({ precision: 30, scale: 18 }).notNull(),
  tokenId: varchar({ length: 20 }).notNull(),
  blockchain: varchar({ length: 20 }).notNull(),
  status: paymentStatusEnum().notNull().default('created'),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
