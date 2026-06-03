import type { Metadata } from "next";
import { Suspense } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import SearchClient from "@/components/SearchClient";

export const metadata: Metadata = {
  title: "Search",
  description: "Search every entry in the Ardeo codex.",
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Search" }]}
      />
      <header className="mb-8 text-center">
        <h1 className="font-display text-4xl tracking-[0.12em] text-gold">
          Search the Codex
        </h1>
        <div className="rule-ornament mx-auto mt-4 max-w-xs">✦</div>
      </header>
      <Suspense
        fallback={
          <p className="text-center text-parchment-muted">Unrolling the index…</p>
        }
      >
        <SearchClient />
      </Suspense>
    </div>
  );
}
