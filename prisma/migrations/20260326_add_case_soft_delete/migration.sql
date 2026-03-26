-- AlterTable
ALTER TABLE "Case" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Case_deletedAt_idx" ON "Case"("deletedAt");
