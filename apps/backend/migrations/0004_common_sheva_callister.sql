CREATE TABLE "beta_access" (
	"code" varchar(20) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(100),
	"run_limit" integer DEFAULT 25 NOT NULL,
	"runs_used" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
