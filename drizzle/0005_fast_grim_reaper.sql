DO $$ BEGIN
 ALTER TABLE "Comment" ADD CONSTRAINT "Comment_linkId_Link_id_fk" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
