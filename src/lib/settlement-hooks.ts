import { CaseStatus, SettlementStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function closeCasesForPaidSettlement(settlementId: string, changedBy: string): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const settlement = await tx.settlement.findUnique({
      where: { id: settlementId },
      include: { items: true },
    });

    if (!settlement || settlement.status !== SettlementStatus.PAID) {
      return 0;
    }

    const caseIds = settlement.items.map((item) => item.caseId);
    if (caseIds.length === 0) {
      return 0;
    }

    const targetCases = await tx.case.findMany({
      where: { id: { in: caseIds }, status: CaseStatus.SETTLING, deletedAt: null },
      select: { id: true, status: true },
    });

    if (targetCases.length === 0) {
      return 0;
    }

    await tx.case.updateMany({
      where: { id: { in: targetCases.map((c) => c.id) } },
      data: { status: CaseStatus.CLOSED, closedAt: new Date() },
    });

    await tx.caseStatusHistory.createMany({
      data: targetCases.map((c) => ({
        caseId: c.id,
        fromStatus: c.status,
        toStatus: CaseStatus.CLOSED,
        changedBy,
        note: "Auto-closed after settlement paid",
      })),
    });

    return targetCases.length;
  });
}
