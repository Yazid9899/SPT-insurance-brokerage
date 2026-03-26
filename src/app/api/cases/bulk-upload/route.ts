import { CaseStatus, DocumentType, ProductLine, type Currency } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { canManageCase, authOptions } from "@/lib/auth";
import { BULK_UPLOAD_REQUIRED_FIELDS } from "@/lib/bulk-upload/header-aliases";
import { deleteTempDocumentsByIds, getTempDocumentsByIds } from "@/lib/bulk-upload/temp-documents-store";
import { validateBatchSize, validateShipmentRow } from "@/lib/bulk-upload/validators";
import { calculatePremiums } from "@/lib/calculations";
import { generateCaseNumber } from "@/lib/case-number";
import { isOpenCoverActive } from "@/lib/open-cover-status";
import { prisma } from "@/lib/prisma";
import { bulkUploadCreateSchema } from "@/lib/validations";

type CreateResponseTotals = {
  sumInsured: string;
  clientPremium: string;
  insurerPremium: string;
  brokerCommission: string;
};

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bulkUploadCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("Validation failed", { issues: parsed.error.flatten() }), { status: 400 });
  }

  const unresolvedRequiredMappings = BULK_UPLOAD_REQUIRED_FIELDS.filter(
    (field) => !parsed.data.mappings.some((mapping) => mapping.targetField === field),
  );
  if (unresolvedRequiredMappings.length > 0) {
    return NextResponse.json(apiError("Missing required mappings", { unresolvedRequiredMappings }), { status: 400 });
  }

  const openCover = await prisma.openCover.findUnique({ where: { id: parsed.data.openCoverId } });
  if (!openCover) {
    return NextResponse.json(apiError("Open cover not found"), { status: 404 });
  }
  if (!isOpenCoverActive(openCover.effectiveFrom, openCover.effectiveTo)) {
    return NextResponse.json(apiError("Open cover is not active"), { status: 409 });
  }

  const batchSizeError = validateBatchSize(parsed.data.rows);
  if (batchSizeError) {
    return NextResponse.json(apiError(batchSizeError), { status: 400 });
  }

  const reviewedRows = parsed.data.rows.map((row) =>
    validateShipmentRow(
      {
        rowIndex: row.rowIndex,
        origin: row.origin,
        destination: row.destination,
        vessel: row.vessel,
        quantity: row.quantity,
        sumInsured: row.sumInsured,
        etd: row.etd,
        eta: row.eta ?? null,
        notes: row.notes ?? null,
      },
      {
        clientRate: parsed.data.clientRate,
        insurerRate: Number(openCover.insurerRate),
      },
    ),
  );

  const rowsWithErrors = reviewedRows.filter((row) => row.errors.length > 0);
  if (rowsWithErrors.length > 0) {
    return NextResponse.json(apiError("Row validation failed", { rows: rowsWithErrors }), { status: 400 });
  }

  const tempDocuments = getTempDocumentsByIds(parsed.data.tempDocumentIds ?? [], session.user.id);
  if ((parsed.data.tempDocumentIds ?? []).length !== tempDocuments.length) {
    return NextResponse.json(apiError("Some temporary documents are invalid or expired"), { status: 409 });
  }

  const bulkUploadId = `bulk_${Date.now()}`;
  const totals: CreateResponseTotals = {
    sumInsured: "0.00",
    clientPremium: "0.00",
    insurerPremium: "0.00",
    brokerCommission: "0.00",
  };

  const created = await prisma.$transaction(async (tx) => {
    const createdCaseIds: string[] = [];

    for (const item of reviewedRows) {
      const caseNumber = await generateCaseNumber(tx);
      const premiums = calculatePremiums({ sumInsured: item.sumInsured!, clientRate: parsed.data.clientRate, insurerRate: openCover.insurerRate });

      const createdCase = await tx.case.create({
        data: {
          caseNumber,
          productLine: ProductLine.CARGO,
          cargoProduct: openCover.cargoProduct,
          coverType: "OPEN_COVER",
          transportMode: openCover.transportMode,
          clientName: openCover.clientName,
          clientCompany: openCover.clientCompany,
          openCoverId: openCover.id,
          status: CaseStatus.DRAFT,
          currency: openCover.currency as Currency,
          sumInsured: item.sumInsured!,
          clientRate: parsed.data.clientRate,
          insurerRate: openCover.insurerRate,
          clientPremium: premiums.clientPremium,
          insurerPremium: premiums.insurerPremium,
          brokerCommission: premiums.brokerCommission,
          origin: item.origin,
          destination: item.destination,
          vessel: item.vessel,
          quantity: item.quantity,
          etd: item.etd ? new Date(item.etd) : null,
          eta: item.eta ? new Date(item.eta) : null,
          notes: item.notes ?? null,
          createdById: session.user.id,
          bulkUploadId,
        },
      });
      createdCaseIds.push(createdCase.id);

      totals.sumInsured = (Number(totals.sumInsured) + Number(item.sumInsured ?? 0)).toFixed(2);
      totals.clientPremium = (Number(totals.clientPremium) + Number(premiums.clientPremium)).toFixed(2);
      totals.insurerPremium = (Number(totals.insurerPremium) + Number(premiums.insurerPremium)).toFixed(2);
      totals.brokerCommission = (Number(totals.brokerCommission) + Number(premiums.brokerCommission)).toFixed(2);
    }

    for (const tempDoc of tempDocuments) {
      const key = `${bulkUploadId}:${tempDoc.tempDocId}`;
      await Promise.all(
        createdCaseIds.map((caseId) =>
          tx.caseDocument.create({
            data: {
              caseId,
              name: tempDoc.fileName,
              type: DocumentType.OTHER,
              fileName: tempDoc.storageKey,
              filePath: tempDoc.storageKey,
              fileSize: tempDoc.fileSize,
              mimeType: tempDoc.mimeType,
              bulkUploadId,
              sharedDocumentKey: key,
            },
          }),
        ),
      );
    }

    return createdCaseIds;
  });

  deleteTempDocumentsByIds(parsed.data.tempDocumentIds ?? []);

  return NextResponse.json(
    {
      bulkUploadId,
      caseCount: created.length,
      caseIds: created,
      redirectTo: `/cases?bulkUploadId=${encodeURIComponent(bulkUploadId)}`,
      totals,
    },
    { status: 201 },
  );
}
