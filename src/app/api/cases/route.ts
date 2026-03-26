import { CaseStatus, CoverType, Currency, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { canManageCase, authOptions } from "@/lib/auth";
import { generateCaseNumber } from "@/lib/case-number";
import { calculatePremiums } from "@/lib/calculations";
import { isOpenCoverActive } from "@/lib/open-cover-status";
import { prisma } from "@/lib/prisma";
import { caseListFilterSchema, caseUpsertSchema } from "@/lib/validations";

function toCaseSummary(item: {
  id: string;
  caseNumber: string;
  status: CaseStatus;
  productLine: string;
  cargoProduct: string | null;
  coverType: string | null;
  clientName: string;
  currency: Currency;
  sumInsured: Prisma.Decimal;
  brokerCommission: Prisma.Decimal;
  createdAt: Date;
}) {
  return {
    id: item.id,
    caseNumber: item.caseNumber,
    status: item.status,
    productLine: item.productLine,
    cargoProduct: item.cargoProduct,
    coverType: item.coverType,
    clientName: item.clientName,
    sumInsured: item.sumInsured.toFixed(2),
    brokerCommission: item.brokerCommission.toFixed(2),
    currency: item.currency,
    createdAt: item.createdAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const parsed = caseListFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(apiError("Invalid query", { issues: parsed.error.flatten() }), { status: 400 });
  }

  const { page, pageSize, q, status, productLine, cargoProduct, coverType, sortBy, sortDir } = parsed.data;

  const where: Prisma.CaseWhereInput = {
    deletedAt: null,
    ...(q
      ? {
          OR: [
            { caseNumber: { contains: q, mode: "insensitive" } },
            { clientName: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status && status.length > 0 ? { status: { in: status as CaseStatus[] } } : {}),
    ...(productLine ? { productLine } : {}),
    ...(cargoProduct ? { cargoProduct } : {}),
    ...(coverType ? { coverType } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.case.count({ where }),
    prisma.case.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
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
  if (!canManageCase(session)) {
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

  const created = await prisma.case.create({
    data: {
      caseNumber: await generateCaseNumber(),
      productLine: payload.productLine,
      cargoProduct: payload.cargoProduct,
      coverType: payload.coverType,
      transportMode: payload.transportMode,
      openCoverId: payload.openCoverId ?? null,
      clientName,
      clientEmail: payload.clientEmail ?? null,
      clientPhone: payload.clientPhone ?? null,
      clientCompany,
      currency: currency as Currency,
      sumInsured: payload.sumInsured,
      clientRate: payload.clientRate,
      insurerRate,
      clientPremium: premiums.clientPremium,
      insurerPremium: premiums.insurerPremium,
      brokerCommission: premiums.brokerCommission,
      origin: payload.origin ?? null,
      destination: payload.destination ?? null,
      vessel: payload.vessel ?? null,
      quantity: payload.quantity ?? null,
      etd: payload.etd ?? null,
      eta: payload.eta ?? null,
      notes: payload.notes ?? null,
      status: CaseStatus.DRAFT,
      createdById: session.user.id,
    },
  });

  return NextResponse.json(toCaseSummary(created), { status: 201 });
}
