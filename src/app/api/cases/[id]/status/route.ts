import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { authOptions } from "@/lib/auth";
import { canTransition } from "@/lib/status-transitions";
import { prisma } from "@/lib/prisma";
import { caseStatusTransitionSchema } from "@/lib/validations";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = caseStatusTransitionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(apiError("Validation failed", { issues: parsed.error.flatten() }), { status: 400 });
  }

  const existingCase = await prisma.case.findUnique({ where: { id } });
  if (!existingCase) {
    return NextResponse.json(apiError("Case not found"), { status: 404 });
  }

  if (!canTransition(existingCase.status, parsed.data.toStatus)) {
    return NextResponse.json(
      apiError("Invalid status transition", {
        from: existingCase.status,
        to: parsed.data.toStatus,
      }),
      { status: 400 },
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedCase = await tx.case.update({
      where: { id },
      data: {
        status: parsed.data.toStatus,
        closedAt: parsed.data.toStatus === "CLOSED" ? new Date() : null,
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
    coverType: result.coverType,
    openCoverId: result.openCoverId,
    clientName: result.clientName,
    clientCompany: result.clientCompany,
    currency: result.currency,
    clientRate: result.clientRate.toFixed(6),
    insurerRate: result.insurerRate.toFixed(6),
    clientPremium: result.clientPremium.toFixed(2),
    insurerPremium: result.insurerPremium.toFixed(2),
    brokerCommission: result.brokerCommission.toFixed(2),
    createdAt: result.createdAt.toISOString(),
  });
}
