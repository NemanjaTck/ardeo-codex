import Link from "next/link";
import CategorySigil from "@/components/CategorySigil";
import { CATEGORIES } from "@/lib/taxonomy";
import type { Entry } from "@/lib/content";

export default function EntryCard({ entry }: { entry: Entry }) {
  const cat = CATEGORIES[entry.category];
  return (
    <Link
      href={entry.url}
      className="panel group flex gap-4 p-4 transition-colors hover:border-gold-deep/70 hover:bg-ink-600/70"
    >
      <span className="mt-0.5 shrink-0 text-gold-deep transition-colors group-hover:text-gold">
        <CategorySigil sigil={cat.sigil} size={26} />
      </span>
      <span className="min-w-0">
        <span className="flex items-baseline gap-2">
          <span className="truncate font-display text-lg text-parchment transition-colors group-hover:text-gold-bright">
            {entry.title}
          </span>
          {entry.stub && (
            <span className="shrink-0 text-[15px] uppercase tracking-widest text-parchment-faint">
              stub
            </span>
          )}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-parchment-muted line-clamp-2">
          {entry.excerpt}
        </span>
      </span>
    </Link>
  );
}
