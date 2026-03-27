import { CaseStatus, CoverType, Currency } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { canManageCase, authOptions } from "@/lib/auth";
import { calculatePremiums } from "@/lib/calculations";
import { isOpenCoverActive } from "@/lib/open-cover-status";
import { PartyService } from "@/lib/party-service";
import { prisma } from "@/lib/prisma";
import { caseUpsertSchema } from "@/lib/validations";

const EDITABLE_STATUSES: CaseStatus[] = [CaseStatus.DRAFT, CaseStatus.DOCUMENTATION, CaseStatus.UNDERWRITING];

function toCaseDetail(item: {
  id: string;
  caseNumber: string;
  status: CaseStatus;
  productLine: string;
  cargoProduct: string | null;
  coverType: string | null;
  clientName: string;
  clientCompany: string | null;
  clientId: string | null;
  insurerId: string | null;
  insurer: { displayName: string } | null;
  currency: Currency;
  sumInsured: { toFixed: (d: number) => string };
  clientRate: { toFixed: (d: number) => string };
  insurerRate: { toFixed: (d: number) => string };
  clientPremium: { toFixed: (d: number) => string };
  insurerPremium: { toFixed: (d: number) => string };
  brokerCommission: { toFixed: (d: number) => string };
  origin: string | null;
  destination: string | null;
  vessel: string | null;
  quantity: { toFixed: (d: number) => string } | null;
  etd: Date | null;
  eta: Date | null;
  notes: string | null;
  openCoverId: string | null;
  createdAt: Date;
  statusHistory?: Array<{ fromStatus: CaseStatus | null; toStatus: CaseStatus; changedAt: Date; changedBy: string; note: string | null }>;
}) {
  return {
    id: item.id,
    caseNumber: item.caseNumber,
    status: item.status,
    productLine: item.productLine,
    cargoProduct: item.cargoProduct,
    coverType: item.coverType,
    clientName: item.clientName,
    clientCompany: item.clientCompany,
    clientId: item.clientId,
    insurerId: item.insurerId,
    insurerName: item.insurer?.displayName ?? null,
    currency: item.currency,
    sumInsured: item.sumInsured.toFixed(2),
    clientRate: item.clientRate.toFixed(6),
    insurerRate: item.insurerRate.toFixed(6),
    clientPremium: item.clientPremium.toFixed(2),
    insurerPremium: item.insurerPremium.toFixed(2),
    brokerCommission: item.brokerCommission.toFixed(2),
    origin: item.origin,
    destination: item.destination,
    vessel: item.vessel,
    quantity: item.quantity ? item.quantity.toFixed(2) : null,
    etd: item.etd?.toISOString() ?? null,
    eta: item.eta?.toISOString() ?? null,
    notes: item.notes,
    openCoverId: item.openCoverId,
    createdAt: item.createdAt.toISOString(),
    statusHistory:
      item.statusHistory?.map((h) => ({
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        changedAt: h.changedAt.toISOString(),
        changedBy: h.changedBy,
        note: h.note,
      })) ?? [],
  };
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const found = await prisma.case.findFirst({
    where: { id, deletedAt: null },
    include: { statusHistory: { orderBy: { changedAt: "desc" } }, insurer: { select: { displayName: true } } },
  });

  if (!found) {
    return NextResponse.json(apiError("Case not found"), { status: 404 });
  }

  return NextResponse.json(toCaseDetail(found));
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = caseUpsertSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(apiError("Validation failed", { issues: parsed.error.flatten() }), { status: 400 });
  }

  const payload = parsed.data;

  const existingCase = await prisma.case.findFirst({ where: { id, deletedAt: null } });
  if (!existingCase) {
    return NextResponse.json(apiError("Case not found"), { status: 404 });
  }

  if (!EDITABLE_STATUSES.includes(existingCase.status)) {
    return NextResponse.json(apiError("Case cannot be edited in current status"), { status: 409 });
  }

  let insurerRate = payload.insurerRate;
  let currency = payload.currency;
  let clientName = payload.clientName;
  let clientCompany = payload.clientCompany ?? null;
  let clientId = payload.clientId ?? existingCase.clientId;
  let insurerId = payload.insurerId ?? existingCase.insurerId;
  const partyService = new PartyService(prisma as never);

  if (payload.coverType === CoverType.OPEN_COVER) {
    const openCoverId = payload.openCoverId ?? existingCase.openCoverId;
    if (!openCoverId) {
      return NextResponse.json(apiError("openCoverId is required for OPEN_COVER"), { status: 400 });
    }

    const openCover = await prisma.openCover.findUnique({
      where: { id: openCoverId },
      include: { clientLinks: { select: { clientId: true } } },
    });
    if (!openCover) {
      return NextResponse.json(apiError("Open cover not found"), { status: 404 });
    }

    if (!isOpenCoverActive(openCover.effectiveFrom, openCover.effectiveTo)) {
      return NextResponse.json(apiError("Open cover is not active"), { status: 409 });
    }

    insurerRate = Number(openCover.insurerRate);
    currency = openCover.currency;
    insurerId = openCover.insurerId;
    clientId = payload.clientId ?? existingCase.clientId;
    if (!clientId) {
      return NextResponse.json(apiError("clientId is required for OPEN_COVER"), { status: 400 });
    }

    const membership = await partyService.assertOpenCoverClientMembership(openCover.id, clientId);
    if (!membership.ok) {
      return NextResponse.json(apiError(membership.reason === "inactive-client" ? "Selected client is inactive" : "Selected client is not linked to open cover"), { status: 409 });
    }

    const linkedClient = await prisma.client.findUnique({ where: { id: clientId } });
    if (!linkedClient) {
      return NextResponse.json(apiError("Client not found"), { status: 404 });
    }
    clientName = linkedClient.displayName;
    clientCompany = linkedClient.company;
  } else {
    if (!clientId || !insurerId) {
      return NextResponse.json(apiError("clientId and insurerId are required"), { status: 400 });
    }
    const [client, insurer] = await Promise.all([
      prisma.client.findUnique({ where: { id: clientId } }),
      prisma.insurer.findUnique({ where: { id: insurerId } }),
    ]);
    if (!client || client.status !== "ACTIVE") {
      return NextResponse.json(apiError("Client not found or inactive"), { status: 409 });
    }
    if (!insurer || insurer.status !== "ACTIVE") {
      return NextResponse.json(apiError("Insurer not found or inactive"), { status: 409 });
    }
    clientName = client.displayName;
    clientCompany = client.company;
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
      clientEmail: payload.clientEmail ?? null,
      clientPhone: payload.clientPhone ?? null,
      clientCompany,
      clientId,
      insurerId,
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
    },
  });

  const updatedWithInsurer = await prisma.case.findUnique({
    where: { id: updated.id },
    include: { insurer: { select: { displayName: true } } },
  });
  return NextResponse.json(toCaseDetail(updatedWithInsurer ?? (updated as never)));
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;

  const existingCase = await prisma.case.findFirst({
    where: { id, deletedAt: null },
    select: { status: true },
  });

  if (!existingCase) {
    return NextResponse.json(apiError("Case not found"), { status: 404 });
  }

  if (existingCase.status !== CaseStatus.DRAFT) {
    return NextResponse.json(apiError("Only DRAFT cases can be deleted"), { status: 409 });
  }

  await prisma.case.update({ where: { id }, data: { deletedAt: new Date() } });
  return new NextResponse(null, { status: 204 });
}
