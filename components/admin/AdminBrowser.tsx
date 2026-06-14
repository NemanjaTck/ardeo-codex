"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CATEGORIES,
  EDITABLE_CATEGORIES,
  type CategoryKey,
} from "@/lib/taxonomy";
import { formatOrder } from "@/lib/entry-meta";

interface Row {
  category: CategoryKey;
  slug: string;
  title: string;
  age: string | null;
  order: number | null;
  stub: boolean;
}

export default function AdminBrowser({ entries }: { entries: Row[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryKey | "all">("all");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return entries
      .filter((e) => (cat === "all" ? true : e.category === cat))
      .filter((e) => (term ? e.title.toLowerCase().includes(term) : true));
  }, [entries, q, cat]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of entries) m[e.category] = (m[e.category] || 0) + 1;
    return m;
  }, [entries]);

  return (
    <div>
      <input
        className="admin-input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search entries…"
        aria-label="Search entries"
      />

      <div className="mt-3 -mx-1 flex flex-wrap gap-1.5">
        <Chip active={cat === "all"} onClick={() => setCat("all")}>
          All ({entries.length})
        </Chip>
        {EDITABLE_CATEGORIES.filter((c) => counts[c]).map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
            {CATEGORIES[c].label} ({counts[c]})
          </Chip>
        ))}
      </div>

      <ul className="mt-5 space-y-1.5">
        {filtered.map((e) => (
          <li key={`${e.category}/${e.slug}`}>
            <Link
              href={`/admin/edit/${e.category}/${e.slug}/`}
              className="panel group flex items-center gap-3 p-3 transition-colors hover:border-gold-deep/70 hover:bg-ink-600/70"
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="truncate font-display text-base text-parchment group-hover:text-gold-bright">
                    {e.title}
                  </span>
                  {e.stub && (
                    <span className="shrink-0 text-[13px] uppercase tracking-widest text-parchment-faint">
                      stub
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs uppercase tracking-[0.12em] text-parchment-faint">
                  {CATEGORIES[e.category].label}
                  {e.age ? ` · ${e.age}` : ""}
                  {e.order != null ? ` · ${formatOrder(e.order)}` : ""}
                </span>
              </span>
              <span className="shrink-0 text-gold-deep group-hover:text-gold">
                ✎
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="mt-8 text-center text-parchment-muted">
          No entries match.
        </p>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-[13px] uppercase tracking-[0.1em] transition-colors ${
        active
          ? "border-gold-deep bg-gold-deep/20 text-gold-bright"
          : "border-edge text-parchment-muted hover:border-gold-deep/60 hover:text-gold"
      }`}
    >
      {children}
    </button>
  );
}
