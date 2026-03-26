import { DocumentType, ProductLine, type Currency } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError } from "@/lib/api-error";
import { canManageCase, authOptions } from "@/lib/auth";
import { calculatePremiums } from "@/lib/calculations";
import { generateCaseNumber } from "@/lib/case-number";
import { prisma } from "@/lib/prisma";

const bulkUploadSchema = z.object({
  batchId: z.string().min(1),
  cases: z
    .array(
      z.object({
        productLine: z.nativeEnum(ProductLine),
        clientName: z.string().min(1),
        currency: z.enum(["IDR", "USD", "SGD", "MYR"]),
        sumInsured: z.coerce.number().nonnegative(),
        clientRate: z.coerce.number().nonnegative(),
        insurerRate: z.coerce.number().nonnegative(),
      }),
    )
    .min(1),
  sharedDocuments: z
    .array(
      z.object({
        name: z.string().min(1),
        type: z.nativeEnum(DocumentType),
        fileName: z.string().min(1),
        filePath: z.string().min(1),
        fileSize: z.number().int().nonnegative(),
        mimeType: z.string().min(1),
      }),
    )
    .optional()
    .default([]),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bulkUploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("Validation failed", { issues: parsed.error.flatten() }), { status: 400 });
  }

  const created = await prisma.$transaction(async (tx) => {
    const createdCaseIds: string[] = [];

    for (const item of parsed.data.cases) {
      const caseNumber = await generateCaseNumber(tx);
      const premiums = calculatePremiums({
        sumInsured: item.sumInsured,
        clientRate: item.clientRate,
        insurerRate: item.insurerRate,
      });

      const createdCase = await tx.case.create({
        data: {
          caseNumber,
          productLine: item.productLine,
          clientName: item.clientName,
          currency: item.currency as Currency,
          sumInsured: item.sumInsured,
          clientRate: item.clientRate,
          insurerRate: item.insurerRate,
          clientPremium: premiums.clientPremium,
          insurerPremium: premiums.insurerPremium,
          brokerCommission: premiums.brokerCommission,
          createdById: session.user.id,
          bulkUploadId: parsed.data.batchId,
        },
      });
      createdCaseIds.push(createdCase.id);
    }

    for (const sharedDoc of parsed.data.sharedDocuments) {
      const key = `${parsed.data.batchId}:${sharedDoc.filePath}`;
      for (const caseId of createdCaseIds) {
        await tx.caseDocument.create({
          data: {
            caseId,
            name: sharedDoc.name,
            type: sharedDoc.type,
            fileName: sharedDoc.fileName,
            filePath: sharedDoc.filePath,
            fileSize: sharedDoc.fileSize,
            mimeType: sharedDoc.mimeType,
            bulkUploadId: parsed.data.batchId,
            sharedDocumentKey: key,
          },
        });
      }
    }

    return createdCaseIds;
  });

  return NextResponse.json({ createdCaseIds: created, count: created.length }, { status: 201 });
}
