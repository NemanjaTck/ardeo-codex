import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import EntryEditor from "@/components/admin/EntryEditor";
import { isAuthed } from "@/lib/admin-auth";
import {
  EDITABLE_CATEGORIES,
  type CategoryKey,
} from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export default async function NewEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  if (!(await isAuthed())) redirect("/admin/login/");
  const { category } = await searchParams;
  const defaultCategory = (
    category && EDITABLE_CATEGORIES.includes(category as CategoryKey)
      ? category
      : "settlements"
  ) as CategoryKey;

  return (
    <div>
      <AdminHeader title="New entry" />
      <EntryEditor mode="new" defaultCategory={defaultCategory} />
    </div>
  );
}
