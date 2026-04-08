import {
  quotes,
  paymentIntents,
  paymentIntentStatusEnum,
} from './database.schema';

export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;

export type PaymentIntent = typeof paymentIntents.$inferSelect;
export type NewPaymentIntent = typeof paymentIntents.$inferInsert;

export type PaymentIntentStatus =
  (typeof paymentIntentStatusEnum.enumValues)[number];
