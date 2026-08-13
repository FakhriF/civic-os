CREATE TYPE "gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY,
	"name" varchar(50) NOT NULL UNIQUE,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY,
	"name" varchar(100) NOT NULL UNIQUE,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"email" varchar(255) NOT NULL UNIQUE,
	"full_name" varchar(150) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role_id" integer NOT NULL,
	"department_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "citizens" (
	"id" serial PRIMARY KEY,
	"national_id" varchar(20) NOT NULL UNIQUE,
	"full_name" varchar(150) NOT NULL,
	"gender" "gender" NOT NULL,
	"birth_date" date NOT NULL,
	"address" text NOT NULL,
	"occupation" varchar(100) NOT NULL,
	"created_by_id" integer NOT NULL,
	"updated_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"status" "status" DEFAULT 'draft'::"status" NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"department_id" integer NOT NULL,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_users_role_id" ON "users" ("role_id");--> statement-breakpoint
CREATE INDEX "idx_users_department_id" ON "users" ("department_id");--> statement-breakpoint
CREATE INDEX "idx_citizens_full_name" ON "citizens" ("full_name");--> statement-breakpoint
CREATE INDEX "idx_citizens_created_by" ON "citizens" ("created_by_id");--> statement-breakpoint
CREATE INDEX "idx_announcements_department_id" ON "announcements" ("department_id");--> statement-breakpoint
CREATE INDEX "idx_announcements_status" ON "announcements" ("status");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_departments_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id");--> statement-breakpoint
ALTER TABLE "citizens" ADD CONSTRAINT "citizens_created_by_id_users_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "citizens" ADD CONSTRAINT "citizens_updated_by_id_users_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_department_id_departments_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id");--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_id_users_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id");