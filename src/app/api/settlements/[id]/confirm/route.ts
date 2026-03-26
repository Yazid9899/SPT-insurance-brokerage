import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { authOptions, canManageCase } from "@/lib/auth";
import { confirmSettlement } from "@/lib/settlement-service";
import { settlementConfirmSchema } from "@/lib/validations";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = settlementConfirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(apiError("Validation failed", { issues: parsed.error.flatten() }), { status: 400 });
  }

  try {
    const detail = await confirmSettlement({
      settlementId: id,
      changedBy: session.user.id,
      note: parsed.data.note ?? null,
    });
    return NextResponse.json(detail);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to confirm settlement";
    const status = message === "Settlement not found" ? 404 : 409;
    return NextResponse.json(apiError(message), { status });
  }
}

