CREATE TABLE "referees" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "referees_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1000 CACHE 1),
	"applicant_profile_id" integer NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"organization" varchar(255) NOT NULL,
	"designation" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"email" varchar(320) NOT NULL,
	"address" text,
	"relationship" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "constituencies" (
	"id" integer PRIMARY KEY NOT NULL,
	"county_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "counties" (
	"id" integer PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wards" (
	"id" integer PRIMARY KEY NOT NULL,
	"constituency_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"voters" varchar(255),
	"polling_stations" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "courses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"level" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "courses_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "education_grades" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "education_grades_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"level_id" integer NOT NULL,
	"grade" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "education_levels" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "education_levels_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"code" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "education_levels_name_unique" UNIQUE("name"),
	CONSTRAINT "education_levels_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "ethnicities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ethnicities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ethnicities_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "institutions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "institutions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"type" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "institutions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "professional_bodies" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "professional_bodies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"acronym" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professional_bodies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "applicant_profiles" RENAME COLUMN "phone" TO "phone_number";--> statement-breakpoint
ALTER TABLE "applicant_profiles" ALTER COLUMN "gender" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "applicant_profiles" ADD COLUMN "full_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "applicant_profiles" ADD COLUMN "date_of_birth" varchar(10);--> statement-breakpoint
ALTER TABLE "applicant_profiles" ADD COLUMN "ethnicity_id" integer;--> statement-breakpoint
ALTER TABLE "applicant_profiles" ADD COLUMN "home_county_id" integer;--> statement-breakpoint
ALTER TABLE "applicant_profiles" ADD COLUMN "home_sub_county_id" integer;--> statement-breakpoint
ALTER TABLE "applicant_profiles" ADD COLUMN "ward_id" integer;--> statement-breakpoint
ALTER TABLE "qualifications" ADD COLUMN "course_id" integer;--> statement-breakpoint
ALTER TABLE "qualifications" ADD COLUMN "institution_id" integer;--> statement-breakpoint
ALTER TABLE "professional_details" ADD COLUMN "registration_body_id" integer;--> statement-breakpoint
ALTER TABLE "training_courses" ADD COLUMN "course_id" integer;--> statement-breakpoint
ALTER TABLE "training_courses" ADD COLUMN "institution_id" integer;--> statement-breakpoint
ALTER TABLE "professional_memberships" ADD COLUMN "membership_body_id" integer;--> statement-breakpoint
ALTER TABLE "constituencies" ADD CONSTRAINT "constituencies_county_id_counties_id_fk" FOREIGN KEY ("county_id") REFERENCES "public"."counties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wards" ADD CONSTRAINT "wards_constituency_id_constituencies_id_fk" FOREIGN KEY ("constituency_id") REFERENCES "public"."constituencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education_grades" ADD CONSTRAINT "education_grades_level_id_education_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."education_levels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applicant_profiles" ADD CONSTRAINT "applicant_profiles_ethnicity_id_ethnicities_id_fk" FOREIGN KEY ("ethnicity_id") REFERENCES "public"."ethnicities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applicant_profiles" ADD CONSTRAINT "applicant_profiles_home_county_id_counties_id_fk" FOREIGN KEY ("home_county_id") REFERENCES "public"."counties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applicant_profiles" ADD CONSTRAINT "applicant_profiles_home_sub_county_id_constituencies_id_fk" FOREIGN KEY ("home_sub_county_id") REFERENCES "public"."constituencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applicant_profiles" ADD CONSTRAINT "applicant_profiles_ward_id_wards_id_fk" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualifications" ADD CONSTRAINT "qualifications_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualifications" ADD CONSTRAINT "qualifications_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_details" ADD CONSTRAINT "professional_details_registration_body_id_professional_bodies_id_fk" FOREIGN KEY ("registration_body_id") REFERENCES "public"."professional_bodies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_courses" ADD CONSTRAINT "training_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_courses" ADD CONSTRAINT "training_courses_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_memberships" ADD CONSTRAINT "professional_memberships_membership_body_id_professional_bodies_id_fk" FOREIGN KEY ("membership_body_id") REFERENCES "public"."professional_bodies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applicant_profiles" DROP COLUMN "applicant_name";--> statement-breakpoint
ALTER TABLE "applicant_profiles" DROP COLUMN "birth_year";--> statement-breakpoint
ALTER TABLE "applicant_profiles" DROP COLUMN "ethnicity";--> statement-breakpoint
ALTER TABLE "applicant_profiles" DROP COLUMN "home_county";--> statement-breakpoint
ALTER TABLE "applicant_profiles" DROP COLUMN "home_sub_county";--> statement-breakpoint
ALTER TABLE "applicant_profiles" DROP COLUMN "ward";