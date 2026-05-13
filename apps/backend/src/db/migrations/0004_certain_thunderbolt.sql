CREATE TABLE "audit_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"admin_id" integer NOT NULL,
	"action" varchar(50) NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_id" integer NOT NULL,
	"previous_state" jsonb,
	"new_state" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "professional_details" RENAME COLUMN "registration_body" TO "issuing_body";--> statement-breakpoint
ALTER TABLE "professional_details" RENAME COLUMN "registration_body_id" TO "issuing_body_id";--> statement-breakpoint
ALTER TABLE "professional_details" DROP CONSTRAINT "professional_details_registration_body_id_professional_bodies_id_fk";
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "profile_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "professional_details" ADD COLUMN "license_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "professional_details" ADD COLUMN "issue_date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_details" ADD CONSTRAINT "professional_details_issuing_body_id_professional_bodies_id_fk" FOREIGN KEY ("issuing_body_id") REFERENCES "public"."professional_bodies"("id") ON DELETE no action ON UPDATE no action;