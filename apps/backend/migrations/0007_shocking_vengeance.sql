ALTER TABLE "payment_intents" ADD COLUMN "card_id" varchar(100);--> statement-breakpoint
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_cardId_unique" UNIQUE("card_id");