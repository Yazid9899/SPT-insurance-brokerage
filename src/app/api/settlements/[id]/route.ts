import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { authOptions, canManageCase } from "@/lib/auth";
import { getSettlementDetail, updateSettlementMatching } from "@/lib/settlement-service";
import { settlementMatchingUpdateSchema } from "@/lib/validations";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const detail = await getSettlementDetail(id);
  if (!detail) {
    return NextResponse.json(apiError("Settlement not found"), { status: 404 });
  }
  return NextResponse.json(detail);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = settlementMatchingUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("Validation failed", { issues: parsed.error.flatten() }), { status: 400 });
  }

  try {
    const detail = await updateSettlementMatching({ settlementId: id, items: parsed.data.items });
    return NextResponse.json(detail);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update settlement matching";
    const status = message === "Settlement not found" ? 404 : 409;
    return NextResponse.json(apiError(message), { status });
  }
}

