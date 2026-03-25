import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/cases",
  "/open-covers",
  "/settlements",
  "/reports",
  "/email-templates",
  "/api/foundation",
];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  const requiresAuth = protectedRoutes.some((route) => pathname.startsWith(route));

  if (requiresAuth && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
