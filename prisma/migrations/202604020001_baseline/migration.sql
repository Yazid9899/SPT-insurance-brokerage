-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('DRAFT', 'DOCUMENTATION', 'UNDERWRITING', 'ACTIVE', 'BILLING', 'SETTLING', 'CLOSED');

-- CreateEnum
CREATE TYPE "ProductLine" AS ENUM ('CARGO', 'PROPERTY', 'MARINE_HULL', 'UTILITY');

-- CreateEnum
CREATE TYPE "CargoProduct" AS ENUM ('CPO', 'BIODIESEL', 'SHORTENING');

-- CreateEnum
CREATE TYPE "CoverType" AS ENUM ('OPEN_COVER', 'SINGLE_SHIPMENT');

-- CreateEnum
CREATE TYPE "TransportMode" AS ENUM ('MARINE', 'TRUCKING');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('IDR', 'USD', 'SGD', 'MYR');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('POLICY_DOCUMENT', 'BILL_OF_LADING', 'COMMERCIAL_INVOICE', 'PACKING_LIST', 'CERTIFICATE_OF_INSURANCE', 'SURVEY_REPORT', 'CLAIM_FORM', 'ENDORSEMENT', 'DEBIT_NOTE', 'CREDIT_NOTE', 'OTHER');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'PAID');

-- CreateEnum
CREATE TYPE "PartyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PartyAuditAction" AS ENUM ('MERGE', 'SPLIT');

-- CreateEnum
CREATE TYPE "PartyAuditTarget" AS ENUM ('CLIENT', 'INSURER');

-- CreateTable
CREATE TABLE "NumberSequence" (
    "scope" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "lastValue" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NumberSequence_pkey" PRIMARY KEY ("scope","periodKey")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenCover" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientCompany" TEXT NOT NULL,
    "insurerName" TEXT NOT NULL,
    "insurerId" TEXT,
    "cargoProduct" "CargoProduct",
    "transportMode" "TransportMode",
    "insurerRate" DECIMAL(8,6) NOT NULL,
    "currency" "Currency" NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpenCover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "productLine" "ProductLine" NOT NULL,
    "cargoProduct" "CargoProduct",
    "coverType" "CoverType",
    "transportMode" "TransportMode",
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "clientCompany" TEXT,
    "clientId" TEXT,
    "insurerId" TEXT,
    "openCoverId" TEXT,
    "status" "CaseStatus" NOT NULL DEFAULT 'DRAFT',
    "closedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "currency" "Currency" NOT NULL,
    "sumInsured" DECIMAL(20,2) NOT NULL,
    "clientRate" DECIMAL(8,6) NOT NULL,
    "insurerRate" DECIMAL(8,6) NOT NULL,
    "clientPremium" DECIMAL(20,2) NOT NULL,
    "insurerPremium" DECIMAL(20,2) NOT NULL,
    "brokerCommission" DECIMAL(20,2) NOT NULL,
    "origin" TEXT,
    "destination" TEXT,
    "vessel" TEXT,
    "quantity" DECIMAL(12,2),
    "etd" TIMESTAMP(3),
    "eta" TIMESTAMP(3),
    "notes" TEXT,
    "bulkUploadId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "normalizedName" TEXT NOT NULL,
    "normalizedCompany" TEXT NOT NULL,
    "identityKey" TEXT NOT NULL,
    "status" "PartyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insurer" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "normalizedName" TEXT NOT NULL,
    "identityKey" TEXT NOT NULL,
    "status" "PartyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Insurer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenCoverClientLink" (
    "openCoverId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpenCoverClientLink_pkey" PRIMARY KEY ("openCoverId","clientId")
);

-- CreateTable
CREATE TABLE "PartyMergeAudit" (
    "id" TEXT NOT NULL,
    "targetType" "PartyAuditTarget" NOT NULL,
    "action" "PartyAuditAction" NOT NULL,
    "sourceIds" TEXT[],
    "destinationId" TEXT,
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartyMergeAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseDocument" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "notes" TEXT,
    "bulkUploadId" TEXT,
    "sharedDocumentKey" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseEmail" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "templateId" TEXT,
    "to" TEXT NOT NULL,
    "cc" TEXT,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentById" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseStatusHistory" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "fromStatus" "CaseStatus",
    "toStatus" "CaseStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "CaseStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "settlementNumber" TEXT NOT NULL,
    "insurerName" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "currency" "Currency" NOT NULL,
    "totalInsurerPremium" DECIMAL(20,2) NOT NULL,
    "totalBrokerCommission" DECIMAL(20,2) NOT NULL,
    "status" "SettlementStatus" NOT NULL DEFAULT 'DRAFT',
    "confirmedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "paymentRef" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettlementItem" (
    "id" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "insurerPremium" DECIMAL(20,2) NOT NULL,
    "brokerCommission" DECIMAL(20,2) NOT NULL,
    "matched" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SettlementItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OpenCover_reference_key" ON "OpenCover"("reference");

-- CreateIndex
CREATE INDEX "OpenCover_clientName_idx" ON "OpenCover"("clientName");

-- CreateIndex
CREATE INDEX "OpenCover_isActive_idx" ON "OpenCover"("isActive");

-- CreateIndex
CREATE INDEX "OpenCover_insurerId_idx" ON "OpenCover"("insurerId");

-- CreateIndex
CREATE UNIQUE INDEX "Case_caseNumber_key" ON "Case"("caseNumber");

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
CREATE INDEX "Case_deletedAt_idx" ON "Case"("deletedAt");

-- CreateIndex
CREATE INDEX "Case_clientId_idx" ON "Case"("clientId");

-- CreateIndex
CREATE INDEX "Case_insurerId_idx" ON "Case"("insurerId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_identityKey_key" ON "Client"("identityKey");

-- CreateIndex
CREATE INDEX "Client_normalizedName_idx" ON "Client"("normalizedName");

-- CreateIndex
CREATE INDEX "Client_normalizedCompany_idx" ON "Client"("normalizedCompany");

-- CreateIndex
CREATE INDEX "Client_status_idx" ON "Client"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Insurer_identityKey_key" ON "Insurer"("identityKey");

-- CreateIndex
CREATE INDEX "Insurer_normalizedName_idx" ON "Insurer"("normalizedName");

-- CreateIndex
CREATE INDEX "Insurer_status_idx" ON "Insurer"("status");

-- CreateIndex
CREATE INDEX "OpenCoverClientLink_clientId_idx" ON "OpenCoverClientLink"("clientId");

-- CreateIndex
CREATE INDEX "PartyMergeAudit_targetType_createdAt_idx" ON "PartyMergeAudit"("targetType", "createdAt");

-- CreateIndex
CREATE INDEX "CaseDocument_caseId_idx" ON "CaseDocument"("caseId");

-- CreateIndex
CREATE INDEX "CaseDocument_type_idx" ON "CaseDocument"("type");

-- CreateIndex
CREATE INDEX "CaseDocument_bulkUploadId_idx" ON "CaseDocument"("bulkUploadId");

-- CreateIndex
CREATE INDEX "CaseDocument_sharedDocumentKey_idx" ON "CaseDocument"("sharedDocumentKey");

-- CreateIndex
CREATE INDEX "CaseEmail_caseId_idx" ON "CaseEmail"("caseId");

-- CreateIndex
CREATE INDEX "CaseStatusHistory_caseId_idx" ON "CaseStatusHistory"("caseId");

-- CreateIndex
CREATE INDEX "CaseStatusHistory_changedAt_idx" ON "CaseStatusHistory"("changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Settlement_settlementNumber_key" ON "Settlement"("settlementNumber");

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

-- CreateIndex
CREATE UNIQUE INDEX "SettlementItem_settlementId_caseId_key" ON "SettlementItem"("settlementId", "caseId");

-- AddForeignKey
ALTER TABLE "OpenCover" ADD CONSTRAINT "OpenCover_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_openCoverId_fkey" FOREIGN KEY ("openCoverId") REFERENCES "OpenCover"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenCoverClientLink" ADD CONSTRAINT "OpenCoverClientLink_openCoverId_fkey" FOREIGN KEY ("openCoverId") REFERENCES "OpenCover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenCoverClientLink" ADD CONSTRAINT "OpenCoverClientLink_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

