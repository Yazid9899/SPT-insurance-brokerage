import { Currency, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { authOptions } from "@/lib/auth";
import { isOpenCoverActive } from "@/lib/open-cover-status";
import { prisma } from "@/lib/prisma";
import { openCoverUpsertSchema } from "@/lib/validations";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const caseStatus = request.nextUrl.searchParams.get("caseStatus") ?? undefined;
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  const openCover = await prisma.openCover.findUnique({
    where: { id },
    include: {
      clientLinks: { include: { client: true } },
      cases: {
        where: {
          ...(caseStatus ? { status: caseStatus as never } : {}),
          ...(from || to
            ? {
                createdAt: {
                  ...(from ? { gte: new Date(from) } : {}),
                  ...(to ? { lte: new Date(to) } : {}),
                },
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!openCover) {
    return NextResponse.json(apiError("Open cover not found"), { status: 404 });
  }

  return NextResponse.json({
    agreement: {
      id: openCover.id,
      reference: openCover.reference,
      clientName: openCover.clientName,
      clientCompany: openCover.clientCompany,
      clientIds: openCover.clientLinks.map((item) => item.clientId),
      cargoProduct: openCover.cargoProduct,
      insurerName: openCover.insurerName,
      insurerId: openCover.insurerId,
      insurerRate: openCover.insurerRate.toFixed(6),
      effectiveFrom: openCover.effectiveFrom.toISOString(),
      effectiveTo: openCover.effectiveTo.toISOString(),
      status: isOpenCoverActive(openCover.effectiveFrom, openCover.effectiveTo) ? "ACTIVE" : "EXPIRED",
      declarationCount: openCover.cases.length,
      transportMode: openCover.transportMode,
      currency: openCover.currency,
      notes: openCover.notes,
      linkedClients: openCover.clientLinks.map((item) => ({
        id: item.client.id,
        displayName: item.client.displayName,
        company: item.client.company,
        status: item.client.status,
      })),
    },
    declarations: openCover.cases.map((item) => ({
      id: item.id,
      caseNumber: item.caseNumber,
      status: item.status,
      productLine: item.productLine,
      coverType: item.coverType,
      openCoverId: item.openCoverId,
      clientName: item.clientName,
      clientCompany: item.clientCompany,
      currency: item.currency,
      clientRate: item.clientRate.toFixed(6),
      insurerRate: item.insurerRate.toFixed(6),
      clientPremium: item.clientPremium.toFixed(2),
      insurerPremium: item.insurerPremium.toFixed(2),
      brokerCommission: item.brokerCommission.toFixed(2),
      createdAt: item.createdAt.toISOString(),
    })),
  });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = openCoverUpsertSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(apiError("Validation failed", { issues: parsed.error.flatten() }), { status: 400 });
  }

  const payload = parsed.data;

  const existing = await prisma.openCover.findUnique({
    where: { id },
    include: { cases: { select: { id: true, createdAt: true } }, clientLinks: { select: { clientId: true } } },
  });

  if (!existing) {
    return NextResponse.json(apiError("Open cover not found"), { status: 404 });
  }

  const hasOutOfRangeDeclarations = existing.cases.some((declaration) => {
    return declaration.createdAt < payload.effectiveFrom || declaration.createdAt > payload.effectiveTo;
  });

  if (hasOutOfRangeDeclarations) {
    return NextResponse.json(apiError("Effective period cannot exclude existing declarations"), { status: 409 });
  }

  const [insurer, clients] = await Promise.all([
    payload.insurerId ? prisma.insurer.findUnique({ where: { id: payload.insurerId } }) : null,
    payload.clientIds.length > 0 ? prisma.client.findMany({ where: { id: { in: payload.clientIds } } }) : [],
  ]);

  if (payload.insurerId && (!insurer || insurer.status !== "ACTIVE")) {
    return NextResponse.json(apiError("Insurer not found or inactive"), { status: 409 });
  }
  if (payload.isActive && payload.clientIds.length === 0) {
    return NextResponse.json(apiError("Active open cover requires at least one linked client"), { status: 400 });
  }
  if (clients.some((client) => client.status !== "ACTIVE")) {
    return NextResponse.json(apiError("Inactive clients cannot be linked to active open cover"), { status: 409 });
  }
  const snapshotClient = clients[0] ?? null;

  try {
    const updated = await prisma.openCover.update({
      where: { id },
      data: {
        reference: payload.reference,
        clientName: snapshotClient?.displayName ?? payload.clientName,
        clientCompany: snapshotClient?.company ?? payload.clientCompany,
        insurerName: insurer?.displayName ?? payload.insurerName,
        insurerId: payload.insurerId ?? null,
        cargoProduct: payload.cargoProduct,
        transportMode: payload.transportMode,
        currency: payload.currency as Currency,
        insurerRate: payload.insurerRate,
        effectiveFrom: payload.effectiveFrom,
        effectiveTo: payload.effectiveTo,
        isActive: payload.isActive,
        notes: payload.notes ?? null,
        clientLinks: {
          deleteMany: {},
          createMany: {
            data: payload.clientIds.map((clientId) => ({ clientId })),
            skipDuplicates: true,
          },
        },
      },
      include: { cases: { select: { id: true } }, clientLinks: { include: { client: true } } },
    });

    return NextResponse.json({
      id: updated.id,
      reference: updated.reference,
      clientName: updated.clientName,
      clientCompany: updated.clientCompany,
      clientIds: updated.clientLinks.map((item) => item.clientId),
      cargoProduct: updated.cargoProduct,
      insurerName: updated.insurerName,
      insurerId: updated.insurerId,
      insurerRate: updated.insurerRate.toFixed(6),
      effectiveFrom: updated.effectiveFrom.toISOString(),
      effectiveTo: updated.effectiveTo.toISOString(),
      status: isOpenCoverActive(updated.effectiveFrom, updated.effectiveTo) ? "ACTIVE" : "EXPIRED",
      declarationCount: updated.cases.length,
      transportMode: updated.transportMode,
      currency: updated.currency,
      notes: updated.notes,
      linkedClients: updated.clientLinks.map((item) => ({
        id: item.client.id,
        displayName: item.client.displayName,
        company: item.client.company,
        status: item.client.status,
      })),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(apiError("Open cover reference already exists"), { status: 409 });
    }

    return NextResponse.json(apiError("Failed to update open cover"), { status: 500 });
  }
}
