-- Foundation migration SQL generated for initial baseline
CREATE TYPE "CaseStatus" AS ENUM ('DRAFT', 'DOCUMENTATION', 'UNDERWRITING', 'ACTIVE', 'BILLING', 'SETTLING', 'CLOSED');
CREATE TYPE "ProductLine" AS ENUM ('CARGO', 'PROPERTY', 'MARINE_HULL', 'UTILITY');
CREATE TYPE "CargoProduct" AS ENUM ('CPO', 'BIODIESEL', 'SHORTENING');
CREATE TYPE "CoverType" AS ENUM ('OPEN_COVER', 'SINGLE_SHIPMENT');
CREATE TYPE "TransportMode" AS ENUM ('MARINE', 'TRUCKING');
CREATE TYPE "Currency" AS ENUM ('IDR', 'USD', 'SGD', 'MYR');
CREATE TYPE "DocumentType" AS ENUM ('POLICY_DOCUMENT', 'BILL_OF_LADING', 'COMMERCIAL_INVOICE', 'PACKING_LIST', 'CERTIFICATE_OF_INSURANCE', 'SURVEY_REPORT', 'CLAIM_FORM', 'ENDORSEMENT', 'DEBIT_NOTE', 'CREDIT_NOTE', 'OTHER');
CREATE TYPE "SettlementStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'PAID');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "OpenCover" (
  "id" TEXT PRIMARY KEY,
  "reference" TEXT NOT NULL UNIQUE,
  "clientName" TEXT NOT NULL,
  "clientCompany" TEXT NOT NULL,
  "insurerName" TEXT NOT NULL,
  "cargoProduct" "CargoProduct",
  "transportMode" "TransportMode",
  "insurerRate" DECIMAL(8,6) NOT NULL,
  "currency" "Currency" NOT NULL,
  "effectiveFrom" TIMESTAMP NOT NULL,
  "effectiveTo" TIMESTAMP NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "notes" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Case" (
  "id" TEXT PRIMARY KEY,
  "caseNumber" TEXT NOT NULL UNIQUE,
  "productLine" "ProductLine" NOT NULL,
  "cargoProduct" "CargoProduct",
  "coverType" "CoverType",
  "transportMode" "TransportMode",
  "clientName" TEXT NOT NULL,
  "clientEmail" TEXT,
  "clientPhone" TEXT,
  "clientCompany" TEXT,
  "openCoverId" TEXT,
  "status" "CaseStatus" NOT NULL DEFAULT 'DRAFT',
  "closedAt" TIMESTAMP,
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
  "etd" TIMESTAMP,
  "eta" TIMESTAMP,
  "notes" TEXT,
  "bulkUploadId" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Case_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id"),
  CONSTRAINT "Case_openCoverId_fkey" FOREIGN KEY ("openCoverId") REFERENCES "OpenCover"("id")
);

CREATE TABLE "CaseDocument" (
  "id" TEXT PRIMARY KEY,
  "caseId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "DocumentType" NOT NULL,
  "fileName" TEXT NOT NULL,
  "filePath" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "mimeType" TEXT NOT NULL,
  "notes" TEXT,
  "uploadedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "CaseDocument_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE
);

CREATE TABLE "CaseEmail" (
  "id" TEXT PRIMARY KEY,
  "caseId" TEXT NOT NULL,
  "templateId" TEXT,
  "to" TEXT NOT NULL,
  "cc" TEXT,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "sentById" TEXT NOT NULL,
  "sentAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "CaseEmail_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE,
  CONSTRAINT "CaseEmail_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id")
);

CREATE TABLE "CaseStatusHistory" (
  "id" TEXT PRIMARY KEY,
  "caseId" TEXT NOT NULL,
  "fromStatus" "CaseStatus",
  "toStatus" "CaseStatus" NOT NULL,
  "changedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "changedBy" TEXT NOT NULL,
  "note" TEXT,
  CONSTRAINT "CaseStatusHistory_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE
);

CREATE TABLE "Settlement" (
  "id" TEXT PRIMARY KEY,
  "settlementNumber" TEXT NOT NULL UNIQUE,
  "insurerName" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "currency" "Currency" NOT NULL,
  "totalInsurerPremium" DECIMAL(20,2) NOT NULL,
  "totalBrokerCommission" DECIMAL(20,2) NOT NULL,
  "status" "SettlementStatus" NOT NULL DEFAULT 'DRAFT',
  "confirmedAt" TIMESTAMP,
  "paidAt" TIMESTAMP,
  "paymentRef" TEXT,
  "notes" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Settlement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id")
);

CREATE TABLE "SettlementItem" (
  "id" TEXT PRIMARY KEY,
  "settlementId" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "insurerPremium" DECIMAL(20,2) NOT NULL,
  "brokerCommission" DECIMAL(20,2) NOT NULL,
  "matched" BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT "SettlementItem_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "Settlement"("id") ON DELETE CASCADE,
  CONSTRAINT "SettlementItem_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id"),
  CONSTRAINT "SettlementItem_settlementId_caseId_key" UNIQUE ("settlementId", "caseId")
);
