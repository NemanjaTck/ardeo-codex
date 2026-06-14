import Link from "next/link";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminBrowser from "@/components/admin/AdminBrowser";
import { isAuthed } from "@/lib/admin-auth";
import { listEntries, isGithubBackend } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  if (!(await isAuthed())) redirect("/admin/login/");

  let entries: Awaited<ReturnType<typeof listEntries>> = [];
  let loadError: string | null = null;
  try {
    entries = await listEntries();
  } catch (e) {
    loadError = (e as Error).message;
  }

  const rows = entries.map((e) => ({
    category: e.category,
    slug: e.slug,
    title: e.title,
    age: e.age,
    order: e.order,
    stub: e.stub,
  }));

  return (
    <div>
      <AdminHeader title="All entries" />

      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-parchment-muted">
          {entries.length} entries ·{" "}
          <span className="text-parchment-faint">
            {isGithubBackend() ? "saving to GitHub" : "saving to local files"}
          </span>
        </p>
        <Link href="/admin/new/" className="btn-gold">
          ＋ New
        </Link>
      </div>

      {loadError ? (
        <p className="rounded-sm border border-blood/60 bg-blood/15 px-4 py-3 text-sm text-ember">
          Could not load entries: {loadError}
        </p>
      ) : (
        <AdminBrowser entries={rows} />
      )}
    </div>
  );
}
