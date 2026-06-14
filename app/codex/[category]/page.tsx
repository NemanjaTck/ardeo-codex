import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import CategorySigil from "@/components/CategorySigil";
import EntryCard from "@/components/EntryCard";
import EditButton from "@/components/EditButton";
import {
  categoriesPresent,
  entriesByCategory,
  settlementsAndVillages,
} from "@/lib/content";
import { CATEGORIES } from "@/lib/taxonomy";
import type { Entry } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return categoriesPresent().map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES[category as keyof typeof CATEGORIES];
  if (!cat) return {};
  return { title: cat.label, description: cat.blurb };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = CATEGORIES[category as keyof typeof CATEGORIES];
  if (!cat) notFound();

  const isSettlements = category === "settlements";
  const isLore = category === "lore";

  // The "Settlements" page merges in villages (each keeps its own icon).
  const settlements = isSettlements ? entriesByCategory("settlements") : [];
  const villages = isSettlements ? entriesByCategory("villages") : [];
  const entries: Entry[] = isSettlements
    ? settlementsAndVillages()
    : entriesByCategory(category);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Codex", href: "/codex/" },
          { label: cat.label },
        ]}
      />

      <header className="mb-10 flex flex-col items-center text-center">
        <span className="text-gold-deep">
          <CategorySigil sigil={cat.sigil} size={48} />
        </span>
        <h1 className="mt-4 font-display text-4xl tracking-[0.1em] text-gold">
          {isSettlements ? "Settlements" : cat.label}
        </h1>
        <div className="rule-ornament mx-auto mt-4 max-w-[14rem]">✦</div>
        <p className="mt-4 max-w-xl text-parchment-muted">{cat.blurb}</p>
        <p className="mt-3 text-sm text-parchment-faint">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </p>
        <div className="mt-5 flex items-center gap-3">
          {isLore && (
            <Link
              href="/history/"
              className="text-sm link-gold underline-offset-4 hover:underline"
            >
              Read these as a continuous history →
            </Link>
          )}
          <EditButton href={`/admin/new/?category=${category}`} label="New" />
        </div>
      </header>

      {isSettlements ? (
        <div className="space-y-10">
          <Group title="Cities & Towns" entries={settlements} />
          <Group title="Villages" entries={villages} />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {entries.map((e) => (
            <EntryCard key={`${e.category}-${e.slug}`} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}

function Group({ title, entries }: { title: string; entries: Entry[] }) {
  if (entries.length === 0) return null;
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-display text-xl tracking-wide text-parchment-soft">
          {title}
        </h2>
        <span className="h-px flex-1 bg-edge/70" />
        <span className="text-xs text-parchment-faint">{entries.length}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {entries.map((e) => (
          <EntryCard key={`${e.category}-${e.slug}`} entry={e} />
        ))}
      </div>
    </section>
  );
}
