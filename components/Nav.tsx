"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminAuth } from "@/components/useAdminAuth";

export interface NavItem {
  key: string;
  label: string;
  href: string;
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default function Nav({ items }: { items: NavItem[] }) {
  const [mobile, setMobile] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const authed = useAdminAuth();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    setMobile(false);
    router.push(term ? `/search/?q=${encodeURIComponent(term)}` : "/search/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-edge/70 bg-ink-900/85 backdrop-blur supports-[backdrop-filter]:bg-ink-900/70">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3">
        <Link
          href="/"
          className="font-display text-[22px] font-semibold tracking-[0.25em] text-gold transition-colors hover:text-gold-bright"
          onClick={() => setMobile(false)}
        >
          ARDEO
        </Link>

        {/* Desktop nav — flat, no submenus */}
        <nav className="ml-auto hidden items-center gap-0.5 lg:flex">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded px-2.5 py-2 font-display text-[16px] tracking-wide text-parchment-soft transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}

          {authed && (
            <Link
              href="/admin/"
              className="rounded px-2.5 py-2 font-display text-[16px] tracking-wide text-gold-deep transition-colors hover:text-gold"
            >
              ✦ Edit
            </Link>
          )}

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
                className="w-32 bg-transparent text-sm text-parchment placeholder:text-parchment-faint focus:outline-none xl:w-40"
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
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
            {items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={() => setMobile(false)}
                  className="block py-2 font-display text-base text-parchment-soft hover:text-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {authed && (
              <li>
                <Link
                  href="/admin/"
                  onClick={() => setMobile(false)}
                  className="block py-2 font-display text-base text-gold-deep hover:text-gold"
                >
                  ✦ Edit
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
