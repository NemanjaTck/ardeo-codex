import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/admin-auth";
import { readEntry } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAuthed()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "";
  const slug = searchParams.get("slug") || "";
  if (!category || !slug)
    return NextResponse.json(
      { error: "category and slug are required" },
      { status: 400 }
    );

  try {
    const entry = await readEntry(category, slug);
    if (!entry)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(entry);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
