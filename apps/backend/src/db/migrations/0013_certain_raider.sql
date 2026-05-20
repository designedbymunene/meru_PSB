CREATE TABLE "interview_criteria" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "interview_criteria_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"vacancy_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"max_score" integer DEFAULT 20 NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_criteria_scores" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "interview_criteria_scores_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"interview_score_id" integer NOT NULL,
	"criteria_id" integer NOT NULL,
	"score" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interview_criteria" ADD CONSTRAINT "interview_criteria_vacancy_id_vacancies_id_fk" FOREIGN KEY ("vacancy_id") REFERENCES "public"."vacancies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_criteria_scores" ADD CONSTRAINT "interview_criteria_scores_interview_score_id_interview_scores_id_fk" FOREIGN KEY ("interview_score_id") REFERENCES "public"."interview_scores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_criteria_scores" ADD CONSTRAINT "interview_criteria_scores_criteria_id_interview_criteria_id_fk" FOREIGN KEY ("criteria_id") REFERENCES "public"."interview_criteria"("id") ON DELETE cascade ON UPDATE no action;