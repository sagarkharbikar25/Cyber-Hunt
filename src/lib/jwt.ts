import { SignJWT, jwtVerify } from "jose";
import type { AuthPayload } from "@/types";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "mock-secret-key-for-local-development-only");
const COOKIE_NAME = "cyberhunt_token";

export async function signToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("6h")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
