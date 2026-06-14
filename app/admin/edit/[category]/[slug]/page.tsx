import Link from "next/link";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import EntryEditor from "@/components/admin/EntryEditor";
import { isAuthed } from "@/lib/admin-auth";
import { readEntry } from "@/lib/store";
import { CATEGORIES, type CategoryKey } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  if (!(await isAuthed())) redirect("/admin/login/");
  const { category, slug } = await params;

  let entry: Awaited<ReturnType<typeof readEntry>> = null;
  let loadError: string | null = null;
  try {
    entry = await readEntry(category, slug);
  } catch (e) {
    loadError = (e as Error).message;
  }

  if (loadError) {
    return (
      <div>
        <AdminHeader title="Edit" />
        <p className="rounded-sm border border-blood/60 bg-blood/15 px-4 py-3 text-sm text-ember">
          Could not load this entry: {loadError}
        </p>
      </div>
    );
  }

  if (!entry || !CATEGORIES[category as CategoryKey]) {
    return (
      <div>
        <AdminHeader title="Edit" />
        <p className="panel p-6 text-center text-parchment-muted">
          Entry not found.{" "}
          <Link href="/admin/" className="link-gold underline">
            Back to all entries
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title={entry.meta.title} />
      <EntryEditor
        mode="edit"
        initial={{
          category: entry.meta.category,
          slug: entry.meta.slug,
          title: entry.meta.title,
          body: entry.body,
          age: entry.meta.age,
          order: entry.meta.order,
          domain: entry.meta.domain ?? null,
        }}
      />
    </div>
  );
}
