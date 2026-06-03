import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import CategorySigil from "@/components/CategorySigil";
import Markdown from "@/components/Markdown";
import {
  allEntries,
  getEntry,
  entryBody,
  siblings,
} from "@/lib/content";
import { CATEGORIES, sectionForCategory } from "@/lib/taxonomy";

export const dynamicParams = false;

export function generateStaticParams() {
  return allEntries().map((e) => ({ category: e.category, slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const entry = getEntry(category, slug);
  if (!entry) return {};
  return {
    title: entry.title,
    description: entry.excerpt,
  };
}

export default async function EntryPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const entry = getEntry(category, slug);
  if (!entry) notFound();
  const cat = CATEGORIES[entry.category];
  const section = sectionForCategory(entry.category);
  const body = entryBody(entry.category, entry.slug);
  const { prev, next, siblings: related } = siblings(
    entry.category,
    entry.slug
  );

  return (
    <article className="mx-auto max-w-5xl px-5 py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Codex", href: "/codex/" },
          { label: cat.label, href: `/codex/${entry.category}/` },
          { label: entry.title },
        ]}
      />

      <header className="mb-8">
        <div className="badge">
          <CategorySigil sigil={cat.sigil} size={14} />
          {cat.singular}
        </div>
        <h1 className="mt-3 font-display text-4xl leading-tight text-gold sm:text-5xl">
          {entry.title}
        </h1>
        {entry.age && (
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-parchment-faint">
            {entry.age}
          </p>
        )}
        <div className="rule-ornament mt-5 max-w-full">✦</div>
      </header>

      <div className="gap-10 lg:grid lg:grid-cols-[1fr_17rem]">
        {/* Main text */}
        <div className="order-2 lg:order-1">
          {entry.stub ? (
            <div className="panel p-8 text-center">
              <p className="font-display text-lg text-parchment-soft">
                This entry awaits its chronicler.
              </p>
              <p className="mt-2 text-sm text-parchment-muted">
                Its tale has yet to be set down in the codex.
              </p>
            </div>
          ) : (
            <Markdown source={body} dropcap />
          )}

          {/* Prev / Next */}
          {(prev || next) && (
            <nav className="mt-12 flex items-stretch justify-between gap-3 border-t border-edge/60 pt-6">
              {prev ? (
                <Link
                  href={prev.url}
                  className="panel flex-1 p-4 transition-colors hover:border-gold-deep/70"
                >
                  <span className="text-xs uppercase tracking-widest text-parchment-faint">
                    ← Previous
                  </span>
                  <span className="mt-1 block font-display text-parchment group-hover:text-gold">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span className="flex-1" />
              )}
              {next ? (
                <Link
                  href={next.url}
                  className="panel flex-1 p-4 text-right transition-colors hover:border-gold-deep/70"
                >
                  <span className="text-xs uppercase tracking-widest text-parchment-faint">
                    Next →
                  </span>
                  <span className="mt-1 block font-display text-parchment group-hover:text-gold">
                    {next.title}
                  </span>
                </Link>
              ) : (
                <span className="flex-1" />
              )}
            </nav>
          )}
        </div>

        {/* Sidebar */}
        <aside className="order-1 mb-8 lg:order-2 lg:mb-0">
          {/* Figure plate (stand-in until an image is added) */}
          <figure className="panel flex flex-col items-center justify-center gap-3 bg-vignette p-8">
            <span className="text-gold-deep/80">
              <CategorySigil sigil={cat.sigil} size={64} />
            </span>
            <figcaption className="text-center font-display text-sm tracking-[0.18em] text-parchment-muted">
              {entry.title}
            </figcaption>
          </figure>

          {/* Details */}
          <dl className="panel mt-4 divide-y divide-edge/50 p-4 text-sm">
            <Detail label="Category" value={cat.label} />
            {section && <Detail label="Realm of lore" value={section.label} />}
            {entry.age && <Detail label="Age" value={entry.age} />}
            {entry.domain && <Detail label="Domain" value={entry.domain} />}
          </dl>

          {/* See also */}
          {related.length > 0 && (
            <div className="panel mt-4 p-4">
              <h2 className="mb-2 font-display text-xs uppercase tracking-[0.2em] text-gold-deep">
                See also
              </h2>
              <ul className="space-y-1.5">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={r.url}
                      className="text-sm text-parchment-muted transition-colors hover:text-gold"
                    >
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0">
      <dt className="text-xs uppercase tracking-wider text-parchment-faint">
        {label}
      </dt>
      <dd className="text-right text-parchment-soft">{value}</dd>
    </div>
  );
}
