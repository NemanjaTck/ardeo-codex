import { NextResponse } from "next/server";
import {
  checkCredentials,
  createToken,
  COOKIE_NAME,
  COOKIE_MAX_AGE,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { username, password } = await req
    .json()
    .catch(() => ({ username: "", password: "" }));

  if (!checkCredentials(username || "", password || "")) {
    return NextResponse.json(
      { ok: false, error: "Wrong username or password." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, createToken(username), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
