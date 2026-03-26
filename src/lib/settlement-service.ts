import { CaseStatus, Prisma, SettlementStatus } from "@prisma/client";
import Decimal from "decimal.js";

import { generateSettlementNumber } from "@/lib/settlement-number";
import { prisma } from "@/lib/prisma";

export type SettlementListFilters = {
  period?: string;
  insurer?: string;
  status?: SettlementStatus;
};

export type SettlementItemView = {
  caseId: string;
  caseNumber: string;
  matched: boolean;
  insurerPremium: string;
  brokerCommission: string;
  caseStatus: CaseStatus;
};

export type SettlementDetailView = {
  id: string;
  settlementNumber: string;
  period: string;
  insurerName: string;
  status: SettlementStatus;
  paymentDate: string | null;
  bankTransferReference: string | null;
  totalInsurerPremium: string;
  totalBrokerCommission: string;
  caseCount: number;
  items: SettlementItemView[];
};

export function aggregateSettlementTotals(
  items: Array<{ matched: boolean; insurerPremium: Prisma.Decimal | string; brokerCommission: Prisma.Decimal | string }>,
) {
  const totals = items.reduce(
    (acc, item) => {
      if (!item.matched) {
        return acc;
      }
      return {
        insurer: acc.insurer.plus(new Decimal(item.insurerPremium.toString())),
        commission: acc.commission.plus(new Decimal(item.brokerCommission.toString())),
      };
    },
    { insurer: new Decimal(0), commission: new Decimal(0) },
  );

  return {
    totalInsurerPremium: totals.insurer.toFixed(2),
    totalBrokerCommission: totals.commission.toFixed(2),
  };
}

function periodRange(period: string) {
  const [yearRaw, monthRaw] = period.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Invalid period format, expected YYYY-MM");
  }
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  return { start, end };
}

async function findEligibleBillingCases(
  tx: Prisma.TransactionClient,
  input: { insurerName: string; period: string },
): Promise<Array<{ id: string; caseNumber: string; insurerPremium: Prisma.Decimal; brokerCommission: Prisma.Decimal; status: CaseStatus }>> {
  const { start, end } = periodRange(input.period);
  const candidates = await tx.case.findMany({
    where: {
      status: CaseStatus.BILLING,
      deletedAt: null,
      openCover: { insurerName: input.insurerName },
    },
    select: {
      id: true,
      caseNumber: true,
      insurerPremium: true,
      brokerCommission: true,
      status: true,
      statusHistory: {
        where: { toStatus: CaseStatus.BILLING },
        orderBy: { changedAt: "asc" },
        select: { changedAt: true },
      },
    },
  });

  const withinPeriod = candidates.filter((item) => {
    const firstBilling = item.statusHistory[0]?.changedAt;
    if (!firstBilling) {
      return false;
    }
    return firstBilling >= start && firstBilling < end;
  });

  if (withinPeriod.length === 0) {
    return [];
  }

  const reserved = await tx.settlementItem.findMany({
    where: {
      caseId: { in: withinPeriod.map((c) => c.id) },
      settlement: { status: { in: [SettlementStatus.DRAFT, SettlementStatus.CONFIRMED] } },
    },
    select: { caseId: true },
  });

  const reservedSet = new Set(reserved.map((r) => r.caseId));
  return withinPeriod
    .filter((item) => !reservedSet.has(item.id))
    .map((item) => ({
      id: item.id,
      caseNumber: item.caseNumber,
      insurerPremium: item.insurerPremium,
      brokerCommission: item.brokerCommission,
      status: item.status,
    }));
}

function toDetailView(settlement: {
  id: string;
  settlementNumber: string;
  period: string;
  insurerName: string;
  status: SettlementStatus;
  paidAt: Date | null;
  paymentRef: string | null;
  items: Array<{
    matched: boolean;
    insurerPremium: Prisma.Decimal;
    brokerCommission: Prisma.Decimal;
    case: { id: string; caseNumber: string; status: CaseStatus };
  }>;
}) {
  const totals = aggregateSettlementTotals(
    settlement.items.map((item) => ({
      matched: item.matched,
      insurerPremium: item.insurerPremium,
      brokerCommission: item.brokerCommission,
    })),
  );
  return {
    id: settlement.id,
    settlementNumber: settlement.settlementNumber,
    period: settlement.period,
    insurerName: settlement.insurerName,
    status: settlement.status,
    paymentDate: settlement.paidAt ? settlement.paidAt.toISOString().slice(0, 10) : null,
    bankTransferReference: settlement.paymentRef,
    totalInsurerPremium: totals.totalInsurerPremium,
    totalBrokerCommission: totals.totalBrokerCommission,
    caseCount: settlement.items.filter((item) => item.matched).length,
    items: settlement.items.map((item) => ({
      caseId: item.case.id,
      caseNumber: item.case.caseNumber,
      matched: item.matched,
      insurerPremium: item.insurerPremium.toFixed(2),
      brokerCommission: item.brokerCommission.toFixed(2),
      caseStatus: item.case.status,
    })),
  } satisfies SettlementDetailView;
}

export async function listSettlements(filters: SettlementListFilters) {
  const items = await prisma.settlement.findMany({
    where: {
      ...(filters.period ? { period: filters.period } : {}),
      ...(filters.insurer ? { insurerName: { contains: filters.insurer, mode: "insensitive" } } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    include: {
      items: {
        where: { matched: true },
        select: { insurerPremium: true, brokerCommission: true },
      },
    },
    orderBy: [{ period: "desc" }, { settlementNumber: "desc" }],
  });

  return items.map((settlement) => {
    const totals = aggregateSettlementTotals(
      settlement.items.map((item) => ({
        matched: true,
        insurerPremium: item.insurerPremium,
        brokerCommission: item.brokerCommission,
      })),
    );
    return {
      id: settlement.id,
      settlementNumber: settlement.settlementNumber,
      period: settlement.period,
      insurerName: settlement.insurerName,
      status: settlement.status,
      caseCount: settlement.items.length,
      totalInsurerPremium: totals.totalInsurerPremium,
      totalBrokerCommission: totals.totalBrokerCommission,
    };
  });
}

export async function getSettlementDetail(settlementId: string): Promise<SettlementDetailView | null> {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: {
      items: {
        include: { case: { select: { id: true, caseNumber: true, status: true } } },
        orderBy: { case: { caseNumber: "asc" } },
      },
    },
  });

  return settlement ? toDetailView(settlement) : null;
}

export async function createDraftSettlement(input: { insurerName: string; period: string; createdById: string }) {
  return prisma.$transaction(async (tx) => {
    const eligibleCases = await findEligibleBillingCases(tx, { insurerName: input.insurerName, period: input.period });
    const settlementNumber = await generateSettlementNumber(input.period, tx);

    const created = await tx.settlement.create({
      data: {
        settlementNumber,
        insurerName: input.insurerName,
        period: input.period,
        status: SettlementStatus.DRAFT,
        createdById: input.createdById,
        currency: "USD",
        totalInsurerPremium: 0,
        totalBrokerCommission: 0,
      },
    });

    if (eligibleCases.length > 0) {
      await tx.settlementItem.createMany({
        data: eligibleCases.map((item) => ({
          settlementId: created.id,
          caseId: item.id,
          insurerPremium: item.insurerPremium,
          brokerCommission: item.brokerCommission,
          matched: true,
        })),
      });
    }

    const detail = await tx.settlement.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        items: {
          include: { case: { select: { id: true, caseNumber: true, status: true } } },
          orderBy: { case: { caseNumber: "asc" } },
        },
      },
    });

    const view = toDetailView(detail);
    await tx.settlement.update({
      where: { id: created.id },
      data: {
        totalInsurerPremium: view.totalInsurerPremium,
        totalBrokerCommission: view.totalBrokerCommission,
      },
    });
    return view;
  });
}

export async function updateSettlementMatching(input: {
  settlementId: string;
  items: Array<{ caseId: string; matched: boolean }>;
}) {
  return prisma.$transaction(async (tx) => {
    const settlement = await tx.settlement.findUnique({
      where: { id: input.settlementId },
      include: { items: true },
    });
    if (!settlement) {
      throw new Error("Settlement not found");
    }
    if (settlement.status !== SettlementStatus.DRAFT) {
      throw new Error("Settlement is locked");
    }

    const allowedCaseIds = new Set(settlement.items.map((item) => item.caseId));
    for (const item of input.items) {
      if (!allowedCaseIds.has(item.caseId)) {
        throw new Error("Invalid case membership update");
      }
    }

    await Promise.all(
      input.items.map((item) =>
        tx.settlementItem.updateMany({
          where: { settlementId: input.settlementId, caseId: item.caseId },
          data: { matched: item.matched },
        }),
      ),
    );

    const detail = await tx.settlement.findUniqueOrThrow({
      where: { id: input.settlementId },
      include: {
        items: {
          include: { case: { select: { id: true, caseNumber: true, status: true } } },
          orderBy: { case: { caseNumber: "asc" } },
        },
      },
    });
    const view = toDetailView(detail);
    await tx.settlement.update({
      where: { id: input.settlementId },
      data: {
        totalInsurerPremium: view.totalInsurerPremium,
        totalBrokerCommission: view.totalBrokerCommission,
      },
    });
    return view;
  });
}

export async function confirmSettlement(input: { settlementId: string; changedBy: string; note?: string | null }) {
  return prisma.$transaction(async (tx) => {
    const settlement = await tx.settlement.findUnique({
      where: { id: input.settlementId },
      include: {
        items: {
          where: { matched: true },
          include: { case: { select: { id: true, status: true } } },
        },
      },
    });

    if (!settlement) {
      throw new Error("Settlement not found");
    }
    if (settlement.status !== SettlementStatus.DRAFT) {
      throw new Error("Settlement must be DRAFT");
    }
    if (settlement.items.length === 0) {
      throw new Error("At least one matched case is required");
    }

    const targetCaseIds = settlement.items.map((item) => item.caseId);
    const currentCases = await tx.case.findMany({
      where: { id: { in: targetCaseIds }, deletedAt: null },
      select: { id: true, status: true },
    });
    if (currentCases.length !== targetCaseIds.length || currentCases.some((c) => c.status !== CaseStatus.BILLING)) {
      throw new Error("Some selected cases are no longer BILLING");
    }

    await tx.case.updateMany({
      where: { id: { in: targetCaseIds } },
      data: { status: CaseStatus.SETTLING },
    });

    await tx.caseStatusHistory.createMany({
      data: targetCaseIds.map((caseId) => ({
        caseId,
        fromStatus: CaseStatus.BILLING,
        toStatus: CaseStatus.SETTLING,
        changedBy: input.changedBy,
        note: input.note ?? "Moved to SETTLING by settlement confirmation",
      })),
    });

    await tx.settlement.update({
      where: { id: settlement.id },
      data: {
        status: SettlementStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
    });

    const detail = await tx.settlement.findUniqueOrThrow({
      where: { id: settlement.id },
      include: {
        items: {
          include: { case: { select: { id: true, caseNumber: true, status: true } } },
          orderBy: { case: { caseNumber: "asc" } },
        },
      },
    });
    return toDetailView(detail);
  });
}

export async function paySettlement(input: {
  settlementId: string;
  changedBy: string;
  paymentDate: Date;
  bankTransferReference: string;
  note?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const settlement = await tx.settlement.findUnique({
      where: { id: input.settlementId },
      include: {
        items: {
          where: { matched: true },
          include: { case: { select: { id: true, status: true } } },
        },
      },
    });

    if (!settlement) {
      throw new Error("Settlement not found");
    }
    if (settlement.status !== SettlementStatus.CONFIRMED) {
      throw new Error("Settlement must be CONFIRMED");
    }

    const existingRef = await tx.settlement.findFirst({
      where: {
        paymentRef: input.bankTransferReference,
        id: { not: settlement.id },
      },
      select: { id: true },
    });
    if (existingRef) {
      throw new Error("Bank transfer reference already used");
    }

    const targetCaseIds = settlement.items.map((item) => item.caseId);
    const currentCases = await tx.case.findMany({
      where: { id: { in: targetCaseIds }, deletedAt: null },
      select: { id: true, status: true },
    });
    if (currentCases.length !== targetCaseIds.length || currentCases.some((c) => c.status !== CaseStatus.SETTLING)) {
      throw new Error("Some matched cases are no longer SETTLING");
    }

    const closedAt = new Date();
    await tx.case.updateMany({
      where: { id: { in: targetCaseIds } },
      data: {
        status: CaseStatus.CLOSED,
        closedAt,
      },
    });

    await tx.caseStatusHistory.createMany({
      data: targetCaseIds.map((caseId) => ({
        caseId,
        fromStatus: CaseStatus.SETTLING,
        toStatus: CaseStatus.CLOSED,
        changedBy: input.changedBy,
        note: input.note ?? "Auto-closed after settlement payment",
      })),
    });

    await tx.settlement.update({
      where: { id: settlement.id },
      data: {
        status: SettlementStatus.PAID,
        paidAt: input.paymentDate,
        paymentRef: input.bankTransferReference,
      },
    });

    const detail = await tx.settlement.findUniqueOrThrow({
      where: { id: settlement.id },
      include: {
        items: {
          include: { case: { select: { id: true, caseNumber: true, status: true } } },
          orderBy: { case: { caseNumber: "asc" } },
        },
      },
    });
    return toDetailView(detail);
  });
}

