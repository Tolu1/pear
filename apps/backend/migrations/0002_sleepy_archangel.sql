CREATE TABLE "quotes" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"amount" numeric(18, 4) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"cryptoAmount" numeric(30, 18) NOT NULL,
	"tokenId" varchar(20) NOT NULL,
	"blockchain" varchar(20) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payment_intents" ADD COLUMN "quoteId" varchar(50) NOT NULL;