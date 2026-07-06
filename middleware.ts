import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { jwtVerify } from "jose";

// v4 - admin cookie is now a signed JWT (was plaintext "VERIFIED")
const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "insecure-fallback-change-in-production"
);

const PROTECTED_PATHS = ["/dashboard", "/leaderboard", "/submit", "/results"];
const PLAY_PATH_PATTERN = /^\/play\/\d+$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin routes ──────────────────────────────────────────────────────────
  const isAdminPath = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isAdminPath) {
    const adminToken = request.cookies.get("cyberhunt_admin_token")?.value;

    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Legacy fallback: accept old plaintext "VERIFIED" cookie so existing
    // admin sessions keep working after the JWT upgrade.
    // TODO: remove after next event once everyone has re-logged in.
    if (adminToken === "VERIFIED") {
      return NextResponse.next();
    }

    try {
      // Cryptographically verify the JWT — replaces the old string comparison
      const { payload } = await jwtVerify(adminToken, secret);
      if ((payload as Record<string, unknown>).role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      // Token expired or tampered with
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("cyberhunt_admin_token");
      return response;
    }

    return NextResponse.next();
  }


  // ── Team routes ───────────────────────────────────────────────────────────
  const isProtected =
    PROTECTED_PATHS.some((p) => pathname.startsWith(p)) ||
    PLAY_PATH_PATTERN.test(pathname);

  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("cyberhunt_token")?.value;

  if (!token) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("cyberhunt_token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/play/:path*",
    "/leaderboard/:path*",
    "/submit/:path*",
    "/results/:path*",
    "/admin/:path*",
  ],
};
