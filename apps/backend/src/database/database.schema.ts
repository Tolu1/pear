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
  id: uuid('id').defaultRandom().primaryKey(),
  domain: varchar('domain', { length: 255 }).notNull(),
  paymentUrl: text('payment_url').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  status: paymentStatusEnum('status').notNull().default('created'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
