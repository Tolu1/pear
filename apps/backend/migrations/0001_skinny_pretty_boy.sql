CREATE TYPE "public"."payment_intent_status" AS ENUM('requires_transfer', 'processing', 'succeeded', 'canceled', 'expired');--> statement-breakpoint
CREATE TABLE "payment_intents" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"status" "payment_intent_status" DEFAULT 'requires_transfer' NOT NULL,
	"amount" numeric(18, 4) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"cryptoAmount" numeric(30, 18) NOT NULL,
	"tokenId" varchar(20) NOT NULL,
	"blockchain" varchar(20) NOT NULL,
	"paymentAddress" varchar(42) NOT NULL,
	"fromAddress" varchar(42) NOT NULL,
	"merchantDomain" varchar(255) NOT NULL,
	"metadata" jsonb,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "payments" CASCADE;--> statement-breakpoint
DROP TYPE "public"."payment_status";