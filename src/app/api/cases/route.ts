import { CaseStatus, CoverType, Currency, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { authOptions } from "@/lib/auth";
import { calculatePremiums } from "@/lib/calculations";
import { isOpenCoverActive } from "@/lib/open-cover-status";
import { prisma } from "@/lib/prisma";
import { caseListFilterSchema, caseUpsertSchema } from "@/lib/validations";

function buildCaseNumber(year: number, sequence: number): string {
  return `BRK-${year}-${String(sequence).padStart(4, "0")}`;
}

async function generateCaseNumber() {
  const year = new Date().getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));

  const count = await prisma.case.count({
    where: {
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });

  return buildCaseNumber(year, count + 1);
}

function toCaseSummary(item: {
  id: string;
  caseNumber: string;
  status: CaseStatus;
  productLine: string;
  coverType: string | null;
  clientName: string;
  clientCompany: string | null;
  currency: Currency;
  clientRate: Prisma.Decimal;
  insurerRate: Prisma.Decimal;
  clientPremium: Prisma.Decimal;
  insurerPremium: Prisma.Decimal;
  brokerCommission: Prisma.Decimal;
  createdAt: Date;
  openCoverId: string | null;
}) {
  return {
    id: item.id,
    caseNumber: item.caseNumber,
    status: item.status,
    productLine: item.productLine,
    coverType: item.coverType,
    clientName: item.clientName,
    clientCompany: item.clientCompany,
    currency: item.currency,
    clientRate: item.clientRate.toFixed(6),
    insurerRate: item.insurerRate.toFixed(6),
    clientPremium: item.clientPremium.toFixed(2),
    insurerPremium: item.insurerPremium.toFixed(2),
    brokerCommission: item.brokerCommission.toFixed(2),
    createdAt: item.createdAt.toISOString(),
    openCoverId: item.openCoverId,
  };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const parsed = caseListFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(apiError("Invalid query", { issues: parsed.error.flatten() }), { status: 400 });
  }

  const { page, pageSize, q, status, productLine, coverType, openCoverId } = parsed.data;

  const where: Prisma.CaseWhereInput = {
    ...(q
      ? {
          OR: [
            { caseNumber: { contains: q, mode: "insensitive" } },
            { clientName: { contains: q, mode: "insensitive" } },
            { clientCompany: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(productLine ? { productLine } : {}),
    ...(coverType ? { coverType } : {}),
    ...(openCoverId ? { openCoverId } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.case.count({ where }),
    prisma.case.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    items: items.map(toCaseSummary),
    page,
    pageSize,
    total,
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = caseUpsertSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(apiError("Validation failed", { issues: parsed.error.flatten() }), { status: 400 });
  }

  const payload = parsed.data;

  let insurerRate = payload.insurerRate;
  let currency = payload.currency;
  let clientName = payload.clientName;
  let clientCompany = payload.clientCompany ?? null;

  if (payload.coverType === CoverType.OPEN_COVER) {
    if (!payload.openCoverId) {
      return NextResponse.json(apiError("openCoverId is required for OPEN_COVER"), { status: 400 });
    }

    const openCover = await prisma.openCover.findUnique({ where: { id: payload.openCoverId } });
    if (!openCover) {
      return NextResponse.json(apiError("Open cover not found"), { status: 404 });
    }

    if (!isOpenCoverActive(openCover.effectiveFrom, openCover.effectiveTo)) {
      return NextResponse.json(apiError("Open cover is not active"), { status: 409 });
    }

    insurerRate = Number(openCover.insurerRate);
    currency = openCover.currency;
    clientName = openCover.clientName;
    clientCompany = openCover.clientCompany;
  }

  const premiums = calculatePremiums({
    sumInsured: payload.sumInsured,
    clientRate: payload.clientRate,
    insurerRate,
  });

  const caseNumber = await generateCaseNumber();

  const created = await prisma.case.create({
    data: {
      caseNumber,
      productLine: payload.productLine,
      cargoProduct: payload.cargoProduct,
      coverType: payload.coverType,
      transportMode: payload.transportMode,
      openCoverId: payload.openCoverId ?? null,
      clientName,
      clientCompany,
      currency: currency as Currency,
      sumInsured: payload.sumInsured,
      clientRate: payload.clientRate,
      insurerRate,
      clientPremium: premiums.clientPremium,
      insurerPremium: premiums.insurerPremium,
      brokerCommission: premiums.brokerCommission,
      notes: payload.notes ?? null,
      status: CaseStatus.DRAFT,
      createdById: session.user.id,
    },
  });

  return NextResponse.json(toCaseSummary(created), { status: 201 });
}
