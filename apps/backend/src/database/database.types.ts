import { payments, paymentStatusEnum } from './database.schema';

export type Payment = typeof payments.$inferSelect;

export type NewPayment = typeof payments.$inferInsert;

export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
