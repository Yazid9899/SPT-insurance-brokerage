import { CoverType, Currency } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { authOptions } from "@/lib/auth";
import { calculatePremiums } from "@/lib/calculations";
import { isOpenCoverActive } from "@/lib/open-cover-status";
import { prisma } from "@/lib/prisma";
import { caseUpsertSchema } from "@/lib/validations";

function toCaseSummary(item: {
  id: string;
  caseNumber: string;
  status: string;
  productLine: string;
  coverType: string | null;
  clientName: string;
  clientCompany: string | null;
  currency: string;
  clientRate: { toFixed: (digits: number) => string };
  insurerRate: { toFixed: (digits: number) => string };
  clientPremium: { toFixed: (digits: number) => string };
  insurerPremium: { toFixed: (digits: number) => string };
  brokerCommission: { toFixed: (digits: number) => string };
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

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = caseUpsertSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(apiError("Validation failed", { issues: parsed.error.flatten() }), { status: 400 });
  }

  const payload = parsed.data;

  const existingCase = await prisma.case.findUnique({ where: { id } });
  if (!existingCase) {
    return NextResponse.json(apiError("Case not found"), { status: 404 });
  }

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

  if (existingCase.coverType === CoverType.OPEN_COVER && existingCase.openCoverId && payload.coverType === CoverType.OPEN_COVER) {
    const lockedCover = await prisma.openCover.findUnique({ where: { id: existingCase.openCoverId } });
    if (lockedCover) {
      insurerRate = Number(lockedCover.insurerRate);
      currency = lockedCover.currency;
    }
  }

  const premiums = calculatePremiums({
    sumInsured: payload.sumInsured,
    clientRate: payload.clientRate,
    insurerRate,
  });

  const updated = await prisma.case.update({
    where: { id },
    data: {
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
    },
  });

  return NextResponse.json(toCaseSummary(updated));
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;

  const existingCase = await prisma.case.findUnique({ where: { id }, select: { status: true } });
  if (!existingCase) {
    return NextResponse.json(apiError("Case not found"), { status: 404 });
  }

  if (existingCase.status !== "DRAFT") {
    return NextResponse.json(apiError("Only DRAFT cases can be deleted"), { status: 409 });
  }

  await prisma.case.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
