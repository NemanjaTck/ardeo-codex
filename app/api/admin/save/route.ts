import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/admin-auth";
import { saveEntry, isGithubBackend, type SaveInput } from "@/lib/store";
import { EDITABLE_CATEGORIES } from "@/lib/taxonomy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAuthed()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = (await req.json().catch(() => null)) as SaveInput | null;
  if (!data || !data.category || !data.title)
    return NextResponse.json(
      { error: "category and title are required" },
      { status: 400 }
    );
  if (!EDITABLE_CATEGORIES.includes(data.category)) {
    return NextResponse.json(
      { error: `Unknown category: ${data.category}` },
      { status: 400 }
    );
  }

  try {
    const result = await saveEntry(data);
    return NextResponse.json({
      ok: true,
      ...result,
      url: `/codex/${result.category}/${result.slug}/`,
      backend: isGithubBackend() ? "github" : "fs",
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
