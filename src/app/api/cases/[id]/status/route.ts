import { CaseStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { canManageCase, authOptions } from "@/lib/auth";
import { calculatePremiums } from "@/lib/calculations";
import { prisma } from "@/lib/prisma";
import { canTransition, validateTransitionInput } from "@/lib/status-transitions";
import { caseStatusTransitionSchema } from "@/lib/validations";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = caseStatusTransitionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(apiError("Validation failed", { issues: parsed.error.flatten() }), { status: 400 });
  }

  const existingCase = await prisma.case.findFirst({
    where: { id, deletedAt: null },
    include: { _count: { select: { documents: true } } },
  });

  if (!existingCase) {
    return NextResponse.json(apiError("Case not found"), { status: 404 });
  }

  if (!canTransition(existingCase.status, parsed.data.toStatus)) {
    return NextResponse.json(apiError("Invalid status transition", { from: existingCase.status, to: parsed.data.toStatus }), { status: 400 });
  }

  const validationError = validateTransitionInput({
    fromStatus: existingCase.status,
    toStatus: parsed.data.toStatus,
    caseData: existingCase,
    documentCount: existingCase._count.documents,
    note: parsed.data.note,
    debitNoteAcknowledged: parsed.data.debitNoteAcknowledged,
    fromSettlementFlow: false,
    settlementPaid: false,
  });

  if (validationError) {
    return NextResponse.json(apiError(validationError), { status: 409 });
  }

  const nextPremiums =
    existingCase.status === CaseStatus.ACTIVE && parsed.data.toStatus === CaseStatus.BILLING
      ? calculatePremiums({
          sumInsured: existingCase.sumInsured,
          clientRate: existingCase.clientRate,
          insurerRate: existingCase.insurerRate,
        })
      : null;

  const result = await prisma.$transaction(async (tx) => {
    const updatedCase = await tx.case.update({
      where: { id },
      data: {
        status: parsed.data.toStatus,
        closedAt: parsed.data.toStatus === CaseStatus.CLOSED ? new Date() : null,
        ...(nextPremiums
          ? {
              clientPremium: nextPremiums.clientPremium,
              insurerPremium: nextPremiums.insurerPremium,
              brokerCommission: nextPremiums.brokerCommission,
            }
          : {}),
      },
    });

    await tx.caseStatusHistory.create({
      data: {
        caseId: id,
        fromStatus: existingCase.status,
        toStatus: parsed.data.toStatus,
        changedBy: session.user.id,
        note: parsed.data.note ?? null,
      },
    });

    return updatedCase;
  });

  return NextResponse.json({
    id: result.id,
    caseNumber: result.caseNumber,
    status: result.status,
    productLine: result.productLine,
    cargoProduct: result.cargoProduct,
    coverType: result.coverType,
    clientName: result.clientName,
    sumInsured: result.sumInsured.toFixed(2),
    clientRate: result.clientRate.toFixed(6),
    insurerRate: result.insurerRate.toFixed(6),
    clientPremium: result.clientPremium.toFixed(2),
    insurerPremium: result.insurerPremium.toFixed(2),
    brokerCommission: result.brokerCommission.toFixed(2),
    createdAt: result.createdAt.toISOString(),
  });
}
