-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_openCoverId_fkey";

-- DropForeignKey
ALTER TABLE "CaseDocument" DROP CONSTRAINT "CaseDocument_caseId_fkey";

-- DropForeignKey
ALTER TABLE "CaseEmail" DROP CONSTRAINT "CaseEmail_caseId_fkey";

-- DropForeignKey
ALTER TABLE "CaseEmail" DROP CONSTRAINT "CaseEmail_sentById_fkey";

-- DropForeignKey
ALTER TABLE "CaseStatusHistory" DROP CONSTRAINT "CaseStatusHistory_caseId_fkey";

-- DropForeignKey
ALTER TABLE "Settlement" DROP CONSTRAINT "Settlement_createdById_fkey";

-- DropForeignKey
ALTER TABLE "SettlementItem" DROP CONSTRAINT "SettlementItem_caseId_fkey";

-- DropForeignKey
ALTER TABLE "SettlementItem" DROP CONSTRAINT "SettlementItem_settlementId_fkey";

-- AlterTable
ALTER TABLE "Case" ALTER COLUMN "closedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "etd" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "eta" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CaseDocument" ALTER COLUMN "uploadedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CaseEmail" ALTER COLUMN "sentAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CaseStatusHistory" ALTER COLUMN "changedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OpenCover" ALTER COLUMN "effectiveFrom" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "effectiveTo" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Settlement" ALTER COLUMN "confirmedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "paidAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Case_status_idx" ON "Case"("status");

-- CreateIndex
CREATE INDEX "Case_productLine_idx" ON "Case"("productLine");

-- CreateIndex
CREATE INDEX "Case_cargoProduct_idx" ON "Case"("cargoProduct");

-- CreateIndex
CREATE INDEX "Case_clientName_idx" ON "Case"("clientName");

-- CreateIndex
CREATE INDEX "Case_createdAt_idx" ON "Case"("createdAt");

-- CreateIndex
CREATE INDEX "Case_openCoverId_idx" ON "Case"("openCoverId");

-- CreateIndex
CREATE INDEX "Case_bulkUploadId_idx" ON "Case"("bulkUploadId");

-- CreateIndex
CREATE INDEX "CaseDocument_caseId_idx" ON "CaseDocument"("caseId");

-- CreateIndex
CREATE INDEX "CaseDocument_type_idx" ON "CaseDocument"("type");

-- CreateIndex
CREATE INDEX "CaseEmail_caseId_idx" ON "CaseEmail"("caseId");

-- CreateIndex
CREATE INDEX "CaseStatusHistory_caseId_idx" ON "CaseStatusHistory"("caseId");

-- CreateIndex
CREATE INDEX "CaseStatusHistory_changedAt_idx" ON "CaseStatusHistory"("changedAt");

-- CreateIndex
CREATE INDEX "OpenCover_clientName_idx" ON "OpenCover"("clientName");

-- CreateIndex
CREATE INDEX "OpenCover_isActive_idx" ON "OpenCover"("isActive");

-- CreateIndex
CREATE INDEX "Settlement_status_idx" ON "Settlement"("status");

-- CreateIndex
CREATE INDEX "Settlement_period_idx" ON "Settlement"("period");

-- CreateIndex
CREATE INDEX "Settlement_insurerName_idx" ON "Settlement"("insurerName");

-- CreateIndex
CREATE INDEX "SettlementItem_settlementId_idx" ON "SettlementItem"("settlementId");

-- CreateIndex
CREATE INDEX "SettlementItem_caseId_idx" ON "SettlementItem"("caseId");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_openCoverId_fkey" FOREIGN KEY ("openCoverId") REFERENCES "OpenCover"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDocument" ADD CONSTRAINT "CaseDocument_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseEmail" ADD CONSTRAINT "CaseEmail_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseEmail" ADD CONSTRAINT "CaseEmail_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseStatusHistory" ADD CONSTRAINT "CaseStatusHistory_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementItem" ADD CONSTRAINT "SettlementItem_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "Settlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementItem" ADD CONSTRAINT "SettlementItem_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
