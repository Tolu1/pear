CREATE TYPE "public"."payment_intent_status" AS ENUM('requires_transfer', 'processing', 'succeeded', 'canceled', 'expired');--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"amount" numeric(18, 4) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"crypto_amount" numeric(30, 18) NOT NULL,
	"rate" numeric(30, 18) NOT NULL,
	"token_id" varchar(20) NOT NULL,
	"blockchain" varchar(20) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"consumed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_intents" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"quote_id" varchar(50) NOT NULL,
	"status" "payment_intent_status" DEFAULT 'requires_transfer' NOT NULL,
	"amount" numeric(18, 4) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"crypto_amount" numeric(30, 18) NOT NULL,
	"token_id" varchar(20) NOT NULL,
	"blockchain" varchar(20) NOT NULL,
	"payment_address" varchar(42) NOT NULL,
	"from_address" varchar(42) NOT NULL,
	"merchant_domain" varchar(255) NOT NULL,
	"metadata" jsonb,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_intents_quoteId_unique" UNIQUE("quote_id")
);
