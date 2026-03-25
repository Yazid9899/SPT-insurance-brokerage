import { Currency, Prisma, ProductLine } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { authOptions } from "@/lib/auth";
import { isOpenCoverActive } from "@/lib/open-cover-status";
import { prisma } from "@/lib/prisma";
import { openCoverListFilterSchema, openCoverUpsertSchema } from "@/lib/validations";

function toListItem(openCover: {
  id: string;
  reference: string;
  clientName: string;
  clientCompany: string;
  cargoProduct: string | null;
  insurerName: string;
  insurerRate: Prisma.Decimal;
  effectiveFrom: Date;
  effectiveTo: Date;
  cases: { id: string }[];
}) {
  return {
    id: openCover.id,
    reference: openCover.reference,
    clientName: openCover.clientName,
    clientCompany: openCover.clientCompany,
    cargoProduct: openCover.cargoProduct,
    insurerName: openCover.insurerName,
    insurerRate: openCover.insurerRate.toFixed(6),
    effectiveFrom: openCover.effectiveFrom.toISOString(),
    effectiveTo: openCover.effectiveTo.toISOString(),
    status: isOpenCoverActive(openCover.effectiveFrom, openCover.effectiveTo) ? "ACTIVE" : "EXPIRED",
    declarationCount: openCover.cases.length,
  };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const parsed = openCoverListFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(apiError("Invalid query", { issues: parsed.error.flatten() }), { status: 400 });
  }

  const { page, pageSize, q, status, activeOnly } = parsed.data;
  const where: Prisma.OpenCoverWhereInput = {
    ...(q
      ? {
          OR: [
            { reference: { contains: q, mode: "insensitive" } },
            { clientName: { contains: q, mode: "insensitive" } },
            { insurerName: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const now = new Date();
  if (activeOnly === "true" || status === "ACTIVE") {
    where.effectiveFrom = { lte: now };
    where.effectiveTo = { gte: now };
  }
  if (status === "EXPIRED") {
    where.OR = [
      { effectiveFrom: { gt: now } },
      { effectiveTo: { lt: now } },
      ...(where.OR ?? []),
    ];
  }

  const [total, items] = await Promise.all([
    prisma.openCover.count({ where }),
    prisma.openCover.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { cases: { select: { id: true } } },
    }),
  ]);

  return NextResponse.json({
    items: items.map(toListItem),
    page,
    pageSize,
    total,
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = openCoverUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("Validation failed", { issues: parsed.error.flatten() }), { status: 400 });
  }

  const payload = parsed.data;

  try {
    const created = await prisma.openCover.create({
      data: {
        reference: payload.reference,
        clientName: payload.clientName,
        clientCompany: payload.clientCompany,
        insurerName: payload.insurerName,
        cargoProduct: payload.cargoProduct,
        transportMode: payload.transportMode,
        currency: payload.currency as Currency,
        insurerRate: payload.insurerRate,
        effectiveFrom: payload.effectiveFrom,
        effectiveTo: payload.effectiveTo,
        isActive: true,
        notes: payload.notes ?? null,
      },
      include: { cases: { select: { id: true } } },
    });

    return NextResponse.json(
      {
        ...toListItem(created),
        productLine: ProductLine.CARGO,
        transportMode: created.transportMode,
        currency: created.currency,
        notes: created.notes,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      Array.isArray(error.meta?.target) &&
      error.meta.target.includes("reference")
    ) {
      return NextResponse.json(apiError("Open cover reference already exists"), { status: 409 });
    }

    return NextResponse.json(apiError("Failed to create open cover"), { status: 500 });
  }
}
