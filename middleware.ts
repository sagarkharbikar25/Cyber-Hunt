import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
// v3 - final clean build

const PROTECTED_PATHS = ["/dashboard", "/leaderboard", "/submit", "/results"];
const PLAY_PATH_PATTERN = /^\/play\/\d+$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPath = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isAdminPath) {
    const adminToken = request.cookies.get("cyberhunt_admin_token")?.value;
    if (adminToken !== "VERIFIED") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  const isProtected =
    PROTECTED_PATHS.some((p) => pathname.startsWith(p)) ||
    PLAY_PATH_PATTERN.test(pathname);

  if (!isProtected) {
    return NextResponse.next();
  }

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
  matcher: ["/dashboard/:path*", "/play/:path*", "/leaderboard/:path*", "/submit/:path*", "/results/:path*", "/admin/:path*"],
};
