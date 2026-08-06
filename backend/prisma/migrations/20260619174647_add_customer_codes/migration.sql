-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "code" TEXT;

-- CreateTable
CREATE TABLE "CustomerCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerCode_code_key" ON "CustomerCode"("code");
