import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import CategorySigil from "@/components/CategorySigil";
import { navItemsPresent } from "@/lib/content";

export const metadata: Metadata = {
  title: "The Codex",
  description: "Browse every section of the Ardeo codex.",
};

export default function CodexIndex() {
  const items = navItemsPresent();

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

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="panel group flex items-center gap-4 p-5 transition-colors hover:border-gold-deep/70 hover:bg-ink-600/70"
          >
            <span className="text-gold-deep group-hover:text-gold">
              <CategorySigil sigil={item.sigil} size={34} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="font-display text-lg text-parchment group-hover:text-gold-bright">
                  {item.label}
                </span>
                <span className="badge !px-2.5 !py-0.5 !text-[13px]">
                  {item.count}
                </span>
              </span>
              <span className="mt-0.5 block text-sm text-parchment-muted">
                {item.blurb}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
