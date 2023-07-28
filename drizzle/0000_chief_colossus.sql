CREATE TABLE IF NOT EXISTS "Comment" (
	"id" serial PRIMARY KEY NOT NULL,
	"body" varchar(40) NOT NULL,
	"linkId" integer,
	"parentId" text
);

CREATE TABLE IF NOT EXISTS "Link" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" varchar(80) NOT NULL,
	"description" varchar(20) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"userId" uuid
);

DO $$ BEGIN
 ALTER TABLE "Comment" ADD CONSTRAINT "Comment_linkId_Link_id_fk" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
