ALTER TABLE "Comment" ALTER COLUMN "body" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "Link" ALTER COLUMN "url" SET DATA TYPE varchar(200);--> statement-breakpoint
ALTER TABLE "Link" ALTER COLUMN "description" SET DATA TYPE varchar(100);