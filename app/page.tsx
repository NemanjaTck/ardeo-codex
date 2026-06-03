import Link from "next/link";
import CategorySigil from "@/components/CategorySigil";
import {
  allEntries,
  sectionsPresent,
  countByCategory,
} from "@/lib/content";
import { CATEGORIES } from "@/lib/taxonomy";

export default function Home() {
  const sections = sectionsPresent();
  const total = allEntries().length;
  const catCount = new Set(allEntries().map((e) => e.category)).size;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-edge/60">
        <div className="mx-auto max-w-4xl px-5 py-24 text-center sm:py-32">
          <p className="font-display text-xs uppercase tracking-[0.45em] text-gold-deep">
            The Codex of
          </p>
          <h1 className="mt-4 font-display text-6xl font-bold tracking-[0.12em] text-gold sm:text-8xl">
            ARDEO
          </h1>
          <div className="rule-ornament mx-auto mt-6 max-w-xs">✦</div>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-parchment-soft">
            An encyclopedia of a world — its realms and ruins, its peoples and
            powers, its gods and the long history that binds them.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/codex/"
              className="rounded-sm border border-gold-deep bg-gold-deep/15 px-6 py-3 font-display text-sm uppercase tracking-[0.18em] text-gold-bright transition-colors hover:bg-gold-deep/30"
            >
              Open the Codex
            </Link>
            <Link
              href="/history/"
              className="rounded-sm border border-edge px-6 py-3 font-display text-sm uppercase tracking-[0.18em] text-parchment-soft transition-colors hover:border-gold-deep hover:text-gold"
            >
              Read the History
            </Link>
          </div>
          <p className="mt-8 text-sm text-parchment-faint">
            {total} entries across {catCount} categories
          </p>
        </div>
      </section>

      {/* Browse */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center font-display text-2xl tracking-[0.2em] text-parchment">
          Browse the Codex
        </h2>
        <div className="rule-ornament mx-auto mt-4 mb-12 max-w-sm">✦</div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <div key={s.key} className="panel p-6">
              <h3 className="font-display text-lg tracking-wide text-gold">
                {s.label}
              </h3>
              <p className="mt-1 text-sm text-parchment-muted">{s.blurb}</p>
              <ul className="mt-4 space-y-1">
                {s.categories.map((c) => (
                  <li key={c}>
                    <Link
                      href={`/codex/${c}/`}
                      className="group flex items-center gap-2.5 rounded-sm px-2 py-1.5 transition-colors hover:bg-ink-600/70"
                    >
                      <span className="text-gold-deep group-hover:text-gold">
                        <CategorySigil sigil={CATEGORIES[c].sigil} size={18} />
                      </span>
                      <span className="text-parchment-soft group-hover:text-gold">
                        {CATEGORIES[c].label}
                      </span>
                      <span className="ml-auto text-xs text-parchment-faint">
                        {countByCategory(c)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
