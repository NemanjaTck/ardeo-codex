import Link from "next/link";
import CategorySigil from "@/components/CategorySigil";
import { allEntries, navItemsPresent } from "@/lib/content";

export default function Home() {
  const items = navItemsPresent();
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

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="panel group flex flex-col p-6 transition-colors hover:border-gold-deep/70 hover:bg-ink-600/60"
            >
              <span className="flex items-center justify-between">
                <span className="text-gold-deep transition-colors group-hover:text-gold">
                  <CategorySigil sigil={item.sigil} size={28} />
                </span>
                <span className="text-xs text-parchment-faint">{item.count}</span>
              </span>
              <h3 className="mt-4 font-display text-lg tracking-wide text-gold group-hover:text-gold-bright">
                {item.label}
              </h3>
              <p className="mt-1 text-sm text-parchment-muted">{item.blurb}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
