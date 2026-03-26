import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { SettlementStatus } from "@prisma/client";

import { apiError } from "@/lib/api-error";
import { authOptions, canManageCase } from "@/lib/auth";
import { createDraftSettlement, listSettlements } from "@/lib/settlement-service";
import { settlementCreateSchema, settlementListFilterSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const parsed = settlementListFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(apiError("Invalid query", { issues: parsed.error.flatten() }), { status: 400 });
  }

  const items = await listSettlements({
    period: parsed.data.period,
    insurer: parsed.data.insurer,
    status: parsed.data.status as SettlementStatus | undefined,
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = settlementCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("Validation failed", { issues: parsed.error.flatten() }), { status: 400 });
  }

  try {
    const detail = await createDraftSettlement({
      insurerName: parsed.data.insurerName,
      period: parsed.data.period,
      createdById: session.user.id,
    });
    return NextResponse.json(detail, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create settlement";
    return NextResponse.json(apiError(message), { status: 409 });
  }
}

