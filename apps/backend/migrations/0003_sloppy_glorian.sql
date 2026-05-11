ALTER TABLE "payment_intents" ADD COLUMN "rail_id" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "quotes" DROP COLUMN "network";