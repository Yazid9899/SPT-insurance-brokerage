import type { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type DbClient = PrismaClient | Prisma.TransactionClient;

function parsePeriod(period: string): { year: string; month: string } {
  const [year, month] = period.split("-");
  if (!year || !month) {
    throw new Error("Invalid settlement period");
  }
  return { year, month };
}

export function formatSettlementNumber(period: string, sequence: number): string {
  const { year, month } = parsePeriod(period);
  return `STL-${year}-${month}-${String(sequence).padStart(3, "0")}`;
}

export async function generateSettlementNumber(period: string, client?: DbClient): Promise<string> {
  const db = client ?? prisma;
  const { year, month } = parsePeriod(period);
  const prefix = `STL-${year}-${month}-`;

  const last = await db.settlement.findFirst({
    where: { settlementNumber: { startsWith: prefix } },
    orderBy: { settlementNumber: "desc" },
    select: { settlementNumber: true },
  });

  const lastSeq = last ? Number(last.settlementNumber.split("-")[3]) : 0;
  return formatSettlementNumber(period, lastSeq + 1);
}

