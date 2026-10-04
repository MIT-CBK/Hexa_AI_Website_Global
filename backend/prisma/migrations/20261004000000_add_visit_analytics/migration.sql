-- Visitor analytics (admin "Analyst" tab) + link leads to their visitor.
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitorId" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Visit_visitorId_idx" ON "Visit"("visitorId");
CREATE INDEX "Visit_createdAt_idx" ON "Visit"("createdAt");

ALTER TABLE "ContactMessage" ADD COLUMN "visitorId" TEXT;
ALTER TABLE "Order" ADD COLUMN "visitorId" TEXT;
