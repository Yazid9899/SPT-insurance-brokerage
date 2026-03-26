import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { apiError } from "@/lib/api-error";
import { authOptions, canManageCase } from "@/lib/auth";
import { getDashboardSummary, getReportSummary, parseReportFilters } from "@/lib/reports-service";
import { reportQuerySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!canManageCase(session)) {
    return NextResponse.json(apiError("Unauthorized"), { status: 401 });
  }

  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = reportQuerySchema.safeParse(query);
  if (!parsed.success) {
    return NextResponse.json(apiError("Invalid query", { issues: parsed.error.flatten() }), { status: 400 });
  }

  try {
    const filters = parseReportFilters(parsed.data);
    const [dashboard, reports] = await Promise.all([getDashboardSummary(), getReportSummary(filters)]);
    return NextResponse.json({ dashboard, reports });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load summary";
    return NextResponse.json(apiError(message), { status: 500 });
  }
}
