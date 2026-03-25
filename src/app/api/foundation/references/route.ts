import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { CASE_LIFECYCLE, CARGO_SUB_PRODUCTS, PRODUCT_LINES } from "@/lib/constants";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    productLines: PRODUCT_LINES,
    cargoSubProducts: CARGO_SUB_PRODUCTS,
    caseLifecycle: CASE_LIFECYCLE,
  });
}
