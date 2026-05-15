CREATE TYPE "public"."document_status" AS ENUM('pending', 'uploaded', 'verified', 'rejected');--> statement-breakpoint
CREATE TABLE "applicant_documents" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "applicant_documents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1000 CACHE 1),
	"user_id" integer NOT NULL,
	"document_type" varchar(100) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"status" "document_status" DEFAULT 'uploaded' NOT NULL,
	"rejection_reason" text,
	"verified_at" timestamp with time zone,
	"verified_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "active_sessions" ALTER COLUMN "os" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "applicant_documents" ADD CONSTRAINT "applicant_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applicant_documents" ADD CONSTRAINT "applicant_documents_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education_grades" ADD CONSTRAINT "education_grades_level_id_grade_unique" UNIQUE("level_id","grade");