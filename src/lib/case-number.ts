import { prisma } from "@/lib/prisma";

export function formatCaseNumber(year: number, sequence: number): string {
  return `BRK-${year}-${String(sequence).padStart(4, "0")}`;
}

export async function generateCaseNumber(): Promise<string> {
  const year = new Date().getUTCFullYear();
  const prefix = `BRK-${year}-`;

  const lastCase = await prisma.case.findFirst({
    where: { caseNumber: { startsWith: prefix } },
    orderBy: { caseNumber: "desc" },
    select: { caseNumber: true },
  });

  const lastSeq = lastCase ? Number(lastCase.caseNumber.split("-")[2]) : 0;
  return formatCaseNumber(year, lastSeq + 1);
}
