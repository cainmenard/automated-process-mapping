CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"industry" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "process_map_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"process_map_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"label" text,
	"bpmn_xml" text NOT NULL,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "process_maps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"bpmn_xml" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"template_id" text,
	"owner_id" text NOT NULL,
	"metadata" jsonb,
	"search_content" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"bpmn_xml" text NOT NULL,
	"form_schema" jsonb NOT NULL,
	"thumbnail_url" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_projects" (
	"user_id" text NOT NULL,
	"project_id" uuid NOT NULL,
	"role" text DEFAULT 'editor' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "process_map_versions" ADD CONSTRAINT "process_map_versions_process_map_id_process_maps_id_fk" FOREIGN KEY ("process_map_id") REFERENCES "public"."process_maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process_maps" ADD CONSTRAINT "process_maps_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_clients_deleted" ON "clients" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_versions_process_map" ON "process_map_versions" USING btree ("process_map_id");--> statement-breakpoint
CREATE INDEX "idx_process_maps_project" ON "process_maps" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_process_maps_owner" ON "process_maps" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_process_maps_deleted" ON "process_maps" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_projects_client" ON "projects" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_projects_deleted" ON "projects" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_user_projects_user" ON "user_projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_projects_project" ON "user_projects" USING btree ("project_id");