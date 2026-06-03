"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import CategorySigil from "@/components/CategorySigil";
import { CATEGORIES, type CategoryKey } from "@/lib/taxonomy";

interface Doc {
  slug: string;
  title: string;
  category: CategoryKey;
  url: string;
  excerpt: string;
  body: string;
  stub: boolean;
}

export default function SearchClient() {
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [filter, setFilter] = useState<CategoryKey | "all">("all");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/search-index.json")
      .then((r) => r.json())
      .then((d: Doc[]) => {
        setDocs(d);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  useEffect(() => setQ(initial), [initial]);

  const fuse = useMemo(
    () =>
      new Fuse(docs, {
        keys: [
          { name: "title", weight: 0.6 },
          { name: "excerpt", weight: 0.25 },
          { name: "body", weight: 0.15 },
        ],
        threshold: 0.34,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [docs]
  );

  const results = useMemo(() => {
    let list: Doc[];
    if (q.trim().length < 2) {
      list = [...docs].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list = fuse.search(q.trim()).map((r) => r.item);
    }
    if (filter !== "all") list = list.filter((d) => d.category === filter);
    return list;
  }, [q, fuse, docs, filter]);

  const presentCats = useMemo(() => {
    const set = new Set(docs.map((d) => d.category));
    return (Object.keys(CATEGORIES) as CategoryKey[]).filter((k) =>
      set.has(k)
    );
  }, [docs]);

  return (
    <div>
      <div className="relative">
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Seek a name, place, or power…"
          aria-label="Search"
          className="w-full rounded-sm border border-edge bg-ink-700/70 px-5 py-4 font-display text-lg text-parchment placeholder:text-parchment-faint focus:border-gold-deep focus:outline-none"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </FilterChip>
        {presentCats.map((c) => (
          <FilterChip
            key={c}
            active={filter === c}
            onClick={() => setFilter(c)}
          >
            {CATEGORIES[c].label}
          </FilterChip>
        ))}
      </div>

      <p className="mt-6 text-sm text-parchment-muted">
        {!loaded
          ? "Unrolling the index…"
          : q.trim().length < 2
          ? `${results.length} entries in the codex`
          : `${results.length} ${results.length === 1 ? "match" : "matches"} for “${q.trim()}”`}
      </p>

      <ul className="mt-4 space-y-2">
        {results.slice(0, 80).map((d) => (
          <li key={`${d.category}-${d.slug}`}>
            <Link
              href={d.url}
              className="panel group flex gap-3 p-3.5 transition-colors hover:border-gold-deep/70 hover:bg-ink-600/70"
            >
              <span className="mt-0.5 shrink-0 text-gold-deep group-hover:text-gold">
                <CategorySigil sigil={CATEGORIES[d.category].sigil} size={22} />
              </span>
              <span className="min-w-0">
                <span className="flex items-baseline gap-2">
                  <span className="font-display text-base text-parchment group-hover:text-gold-bright">
                    {d.title}
                  </span>
                  <span className="text-[15px] uppercase tracking-widest text-parchment-faint">
                    {CATEGORIES[d.category].singular}
                  </span>
                </span>
                <span className="mt-0.5 block text-sm text-parchment-muted line-clamp-1">
                  {d.excerpt}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {loaded && results.length === 0 && (
        <p className="mt-10 text-center text-parchment-muted">
          No entry by that name. Try another word.
        </p>
      )}
    </div>
  );
}

function FilterChip({
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
      className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.12em] transition-colors ${
        active
          ? "border-gold-deep bg-gold-deep/20 text-gold-bright"
          : "border-edge text-parchment-muted hover:border-gold-deep/60 hover:text-gold"
      }`}
    >
      {children}
    </button>
  );
}
