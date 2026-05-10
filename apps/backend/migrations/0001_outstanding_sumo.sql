ALTER TABLE "quotes" RENAME COLUMN "blockchain" TO "network";--> statement-breakpoint
ALTER TABLE "payment_intents" ADD COLUMN "tx_hash" varchar(66);--> statement-breakpoint
ALTER TABLE "payment_intents" DROP COLUMN "amount";--> statement-breakpoint
ALTER TABLE "payment_intents" DROP COLUMN "currency";--> statement-breakpoint
ALTER TABLE "payment_intents" DROP COLUMN "crypto_amount";--> statement-breakpoint
ALTER TABLE "payment_intents" DROP COLUMN "token_id";--> statement-breakpoint
ALTER TABLE "payment_intents" DROP COLUMN "blockchain";--> statement-breakpoint
ALTER TABLE "payment_intents" DROP COLUMN "payment_address";--> statement-breakpoint
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_txHash_unique" UNIQUE("tx_hash");