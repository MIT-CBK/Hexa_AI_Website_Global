-- Add attachments (JSON array of { url, name, size }) to posts.
ALTER TABLE "Post" ADD COLUMN "attachments" TEXT NOT NULL DEFAULT '[]';
