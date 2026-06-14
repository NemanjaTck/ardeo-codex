import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/admin-auth";
import { deleteEntry, isGithubBackend } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAuthed()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { category, slug } = (await req.json().catch(() => ({}))) as {
    category?: string;
    slug?: string;
  };
  if (!category || !slug)
    return NextResponse.json(
      { error: "category and slug are required" },
      { status: 400 }
    );

  try {
    await deleteEntry(category, slug);
    return NextResponse.json({
      ok: true,
      backend: isGithubBackend() ? "github" : "fs",
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
