// Dead-simple session auth: a username/password kept in env vars, and a signed
// (HMAC) cookie once you log in. No database, no external service. Security is
// intentionally minimal — this gates a personal worldbuilding wiki.

import crypto from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "ardeo_admin";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "ardeo-dev-secret-change-me"
  );
}

function hmac(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export interface Session {
  u: string;
  iat: number;
}

/** Create a signed token for a logged-in user. */
export function createToken(username: string): string {
  const payload = Buffer.from(
    JSON.stringify({ u: username, iat: Date.now() })
  ).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

/** Verify a token's signature and return its payload, or null if invalid. */
export function verifyToken(token?: string | null): Session | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = hmac(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/** True when the username/password match the configured env credentials. */
export function checkCredentials(username: string, password: string): boolean {
  const U = process.env.ADMIN_USERNAME;
  const P = process.env.ADMIN_PASSWORD;
  if (!U || !P) return false;
  return username === U && password === P;
}

/** Read + verify the session from the request cookies (server components/routes). */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}

export async function isAuthed(): Promise<boolean> {
  return (await getSession()) !== null;
}

/** True if admin credentials are configured at all (so we can show/hide login). */
export function authConfigured(): boolean {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);
}
