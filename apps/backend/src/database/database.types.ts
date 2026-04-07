import { paymentIntents, paymentIntentStatusEnum } from './database.schema';

export type PaymentIntent = typeof paymentIntents.$inferSelect;

export type NewPaymentIntent = typeof paymentIntents.$inferInsert;

export type PaymentIntentStatus =
  (typeof paymentIntentStatusEnum.enumValues)[number];
