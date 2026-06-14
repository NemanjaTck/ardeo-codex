import { NextResponse } from "next/server";
import { isAuthed, authConfigured } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    authed: await isAuthed(),
    configured: authConfigured(),
  });
}
