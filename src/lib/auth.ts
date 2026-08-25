import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "bh_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type SessionUser = {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  role: "CUSTOMER" | "ADMIN";
};

function secret(): string {
  return (
    process.env.SESSION_SECRET ||
    "dev-secret-change-me-in-production-9f8e7d6c5b4a"
  );
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function encodeSession(user: SessionUser): string {
  const body = Buffer.from(
    JSON.stringify({ ...user, exp: Date.now() + MAX_AGE * 1000 }),
  ).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decodeSession(token: string): SessionUser | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString());
    if (parsed.exp && Date.now() > parsed.exp) return null;
    return parsed as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const store = cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function setSession(user: SessionUser) {
  const store = cookies();
  store.set(COOKIE_NAME, encodeSession(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const store = cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function requireSession(): Promise<SessionUser | null> {
  return getSession();
}

export async function requireAdmin(): Promise<SessionUser | null> {
  const session = await getSession();
  if (session?.role !== "ADMIN") return null;
  return session;
}
