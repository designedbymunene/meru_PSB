ALTER TABLE "applicant_profiles" ADD COLUMN "has_no_experience" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "applicant_profiles" ADD COLUMN "has_no_certificates" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "applicant_profiles" ADD COLUMN "has_no_memberships" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "applicant_profiles" ADD COLUMN "has_no_trainings" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "applicant_profiles" ADD COLUMN "has_no_referees" boolean DEFAULT false NOT NULL;