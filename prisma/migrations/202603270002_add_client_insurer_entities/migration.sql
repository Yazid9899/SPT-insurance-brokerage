-- CreateEnum
CREATE TYPE "PartyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PartyAuditAction" AS ENUM ('MERGE', 'SPLIT');

-- CreateEnum
CREATE TYPE "PartyAuditTarget" AS ENUM ('CLIENT', 'INSURER');

-- AlterTable
ALTER TABLE "Case" ADD COLUMN "clientId" TEXT;
ALTER TABLE "Case" ADD COLUMN "insurerId" TEXT;

-- AlterTable
ALTER TABLE "OpenCover" ADD COLUMN "insurerId" TEXT;

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
  CONSTRAINT "OpenCoverClientLink_pkey" PRIMARY KEY ("openCoverId", "clientId")
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

-- CreateIndex
CREATE UNIQUE INDEX "Client_identityKey_key" ON "Client"("identityKey");
CREATE INDEX "Client_normalizedName_idx" ON "Client"("normalizedName");
CREATE INDEX "Client_normalizedCompany_idx" ON "Client"("normalizedCompany");
CREATE INDEX "Client_status_idx" ON "Client"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Insurer_identityKey_key" ON "Insurer"("identityKey");
CREATE INDEX "Insurer_normalizedName_idx" ON "Insurer"("normalizedName");
CREATE INDEX "Insurer_status_idx" ON "Insurer"("status");

-- CreateIndex
CREATE INDEX "OpenCover_insurerId_idx" ON "OpenCover"("insurerId");
CREATE INDEX "OpenCoverClientLink_clientId_idx" ON "OpenCoverClientLink"("clientId");
CREATE INDEX "PartyMergeAudit_targetType_createdAt_idx" ON "PartyMergeAudit"("targetType", "createdAt");
CREATE INDEX "Case_clientId_idx" ON "Case"("clientId");
CREATE INDEX "Case_insurerId_idx" ON "Case"("insurerId");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Case" ADD CONSTRAINT "Case_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OpenCover" ADD CONSTRAINT "OpenCover_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OpenCoverClientLink" ADD CONSTRAINT "OpenCoverClientLink_openCoverId_fkey" FOREIGN KEY ("openCoverId") REFERENCES "OpenCover"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OpenCoverClientLink" ADD CONSTRAINT "OpenCoverClientLink_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
