import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME } from "./jwt";
import type { AuthPayload } from "@/types";

export async function getAuthUser(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(): Promise<AuthPayload> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("cyberhunt_admin")?.value;
  if (!adminToken) {
    throw new Error("UNAUTHORIZED");
  }
  const { verifyToken: vt } = await import("./jwt");
  const payload = await vt(adminToken);
  if (!payload || (payload as unknown as Record<string, unknown>).role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
}
