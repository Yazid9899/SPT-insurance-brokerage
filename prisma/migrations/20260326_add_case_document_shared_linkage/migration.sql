-- AlterTable
ALTER TABLE "CaseDocument" ADD COLUMN "bulkUploadId" TEXT;
ALTER TABLE "CaseDocument" ADD COLUMN "sharedDocumentKey" TEXT;

-- CreateIndex
CREATE INDEX "CaseDocument_bulkUploadId_idx" ON "CaseDocument"("bulkUploadId");
CREATE INDEX "CaseDocument_sharedDocumentKey_idx" ON "CaseDocument"("sharedDocumentKey");
