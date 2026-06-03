import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import CategorySigil from "@/components/CategorySigil";
import { sectionsPresent, countByCategory } from "@/lib/content";
import { CATEGORIES } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "The Codex",
  description: "Browse every category of the Ardeo codex.",
};

export default function CodexIndex() {
  const sections = sectionsPresent();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Codex" }]} />
      <header className="mb-12 text-center">
        <h1 className="font-display text-4xl tracking-[0.14em] text-gold">
          The Codex
        </h1>
        <div className="rule-ornament mx-auto mt-4 max-w-xs">✦</div>
        <p className="mx-auto mt-4 max-w-xl text-parchment-muted">
          The whole of Ardeo, set in order. Choose a thread and follow it.
        </p>
      </header>

      <div className="space-y-12">
        {sections.map((s) => (
          <section key={s.key}>
            <div className="mb-5 flex items-baseline gap-3">
              <h2 className="font-display text-2xl tracking-wide text-parchment">
                {s.label}
              </h2>
              <span className="h-px flex-1 bg-edge/70" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {s.categories.map((c) => (
                <Link
                  key={c}
                  href={`/codex/${c}/`}
                  className="panel group flex items-center gap-4 p-5 transition-colors hover:border-gold-deep/70 hover:bg-ink-600/70"
                >
                  <span className="text-gold-deep group-hover:text-gold">
                    <CategorySigil sigil={CATEGORIES[c].sigil} size={34} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-display text-lg text-parchment group-hover:text-gold-bright">
                        {CATEGORIES[c].label}
                      </span>
                      <span className="badge !px-2.5 !py-0.5 !text-[13px]">
                        {countByCategory(c)}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-sm text-parchment-muted">
                      {CATEGORIES[c].blurb}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
