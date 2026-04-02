CREATE TYPE "public"."payment_status" AS ENUM('created', 'awaiting_crypto_payment', 'processing_fiat_payment', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchantDomain" varchar(255) NOT NULL,
	"paymentUrl" text NOT NULL,
	"from" varchar(42) NOT NULL,
	"fiatAmount" numeric(10, 4) NOT NULL,
	"fiatCurrencyCode" varchar(3) NOT NULL,
	"tokenAmount" numeric(30, 18) NOT NULL,
	"tokenId" varchar(20) NOT NULL,
	"blockchain" varchar(20) NOT NULL,
	"status" "payment_status" DEFAULT 'created' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
