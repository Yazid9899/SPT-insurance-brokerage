import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { APP_NAME, NAV_ITEMS } from "@/lib/constants";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    appName: APP_NAME,
    user: {
      name: session.user.name,
      email: session.user.email,
    },
    navigation: NAV_ITEMS,
    defaultRoute: "/dashboard",
  });
}
