"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export interface NavCategory {
  key: string;
  label: string;
  href: string;
}
export interface NavSection {
  key: string;
  label: string;
  categories: NavCategory[];
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default function Nav({ sections }: { sections: NavSection[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node))
        setOpen(null);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    setMobile(false);
    router.push(term ? `/search/?q=${encodeURIComponent(term)}` : "/search/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-edge/70 bg-ink-900/85 backdrop-blur supports-[backdrop-filter]:bg-ink-900/70">
      <div ref={navRef} className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3">
        <Link
          href="/"
          className="font-display text-[22px] font-semibold tracking-[0.25em] text-gold transition-colors hover:text-gold-bright"
          onClick={() => setOpen(null)}
        >
          ARDEO
        </Link>

        {/* Desktop nav */}
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {sections.map((s) => {
            if (s.categories.length === 1) {
              return (
                <Link
                  key={s.key}
                  href={s.categories[0].href}
                  className="rounded px-2.5 py-2 font-display text-[16px] tracking-wide text-parchment-soft transition-colors hover:text-gold"
                >
                  {s.label}
                </Link>
              );
            }
            const isOpen = open === s.key;
            return (
              <div key={s.key} className="relative">
                <button
                  onClick={() => setOpen(isOpen ? null : s.key)}
                  className="rounded px-2.5 py-2 font-display text-[16px] tracking-wide text-parchment-soft transition-colors hover:text-gold"
                  aria-expanded={isOpen}
                >
                  {s.label}
                </button>
                {isOpen && (
                  <div className="panel absolute left-0 top-full mt-1 min-w-[220px] p-1.5 shadow-xl shadow-black/40">
                    {s.categories.map((c) => (
                      <Link
                        key={c.key}
                        href={c.href}
                        onClick={() => setOpen(null)}
                        className="block rounded-sm px-3 py-2 text-sm text-parchment-muted transition-colors hover:bg-ink-600 hover:text-gold"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <form onSubmit={submitSearch} className="ml-2 flex items-center">
            <div className="flex items-center gap-2 rounded-full border border-edge bg-ink-700/70 px-3 py-1.5 focus-within:border-gold-deep">
              <span className="text-gold-deep">
                <SearchIcon />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search the codex…"
                aria-label="Search the codex"
                className="w-36 bg-transparent text-sm text-parchment placeholder:text-parchment-faint focus:outline-none xl:w-44"
              />
            </div>
          </form>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobile((m) => !m)}
          className="ml-auto rounded p-2 text-gold lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobile}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            {mobile ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobile && (
        <div className="border-t border-edge/70 bg-ink-800/95 px-5 py-4 lg:hidden">
          <form onSubmit={submitSearch} className="mb-4 flex items-center gap-2 rounded-full border border-edge bg-ink-700 px-3 py-2">
            <span className="text-gold-deep">
              <SearchIcon />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the codex…"
              aria-label="Search the codex"
              className="w-full bg-transparent text-sm text-parchment placeholder:text-parchment-faint focus:outline-none"
            />
          </form>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {sections.map((s) => (
              <div key={s.key}>
                <p className="mb-1.5 font-display text-xs uppercase tracking-[0.18em] text-gold-deep">
                  {s.label}
                </p>
                <ul className="space-y-1">
                  {s.categories.map((c) => (
                    <li key={c.key}>
                      <Link
                        href={c.href}
                        onClick={() => setMobile(false)}
                        className="text-sm text-parchment-muted hover:text-gold"
                      >
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
