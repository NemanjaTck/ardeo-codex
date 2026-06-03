import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import CategorySigil from "@/components/CategorySigil";
import EntryCard from "@/components/EntryCard";
import {
  categoriesPresent,
  entriesByCategory,
} from "@/lib/content";
import { CATEGORIES, sectionForCategory } from "@/lib/taxonomy";

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
  const entries = entriesByCategory(category);
  const section = sectionForCategory(category);
  const isLore = category === "lore";

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
          {cat.label}
        </h1>
        <div className="rule-ornament mx-auto mt-4 max-w-[14rem]">✦</div>
        <p className="mt-4 max-w-xl text-parchment-muted">{cat.blurb}</p>
        <p className="mt-3 text-sm text-parchment-faint">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </p>
        {isLore && (
          <Link
            href="/history/"
            className="mt-5 text-sm link-gold underline-offset-4 hover:underline"
          >
            Read these as a continuous history →
          </Link>
        )}
      </header>

      {section && (
        <p className="mb-6 text-center text-xs uppercase tracking-[0.2em] text-parchment-faint">
          {section.label}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {entries.map((e) => (
          <EntryCard key={e.slug} entry={e} />
        ))}
      </div>
    </div>
  );
}
