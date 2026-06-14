import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import EditButton from "@/components/EditButton";
import { loreByAge, countByCategory } from "@/lib/content";

export const metadata: Metadata = {
  title: "History of Ardeo",
  description:
    "The ages of the world set in order — from the creation to the present peace.",
};

export default function HistoryPage() {
  const ages = loreByAge();
  const hasAnnals = countByCategory("history") > 0;

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "History" }]}
      />

      <header className="mb-14 text-center">
        <h1 className="font-display text-4xl tracking-[0.12em] text-gold sm:text-5xl">
          The Ages of Ardeo
        </h1>
        <div className="rule-ornament mx-auto mt-5 max-w-xs">✦</div>
        <p className="mx-auto mt-5 max-w-xl text-parchment-muted">
          From the shaping of the world to the peace that holds today — the
          chronicle of all that has come to pass, set down in order.
        </p>
        <div className="mt-6 flex justify-center">
          <EditButton href="/admin/new/?category=lore" label="New chapter" />
        </div>
      </header>

      <div className="space-y-16">
        {ages.map((age, ai) => (
          <section key={age.age} className="relative">
            <div className="mb-6 flex items-center gap-4">
              <span className="font-display text-sm text-gold-deep">
                {String(ai + 1).padStart(2, "0")}
              </span>
              <h2 className="font-display text-2xl tracking-wide text-parchment">
                {age.age}
              </h2>
              <span className="h-px flex-1 bg-edge/70" />
            </div>

            <ol className="relative ml-2 space-y-2 border-l border-edge/60 pl-6">
              {age.entries.map((e) => (
                <li key={e.slug} className="relative">
                  <span className="absolute -left-[1.65rem] top-2.5 h-2 w-2 rounded-full bg-gold-deep" />
                  <Link
                    href={e.url}
                    className="panel group block p-4 pr-24 transition-colors hover:border-gold-deep/70 hover:bg-ink-600/70"
                  >
                    <span className="font-display text-lg text-parchment group-hover:text-gold-bright">
                      {e.title}
                    </span>
                    {!e.stub && (
                      <span className="mt-1 block text-sm text-parchment-muted line-clamp-2">
                        {e.excerpt}
                      </span>
                    )}
                  </Link>
                  <div className="absolute right-3 top-3">
                    <EditButton
                      href={`/admin/edit/lore/${e.slug}/`}
                      label="Edit"
                    />
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      {hasAnnals && (
        <div className="mt-16 border-t border-edge/60 pt-8 text-center">
          <Link
            href="/codex/history/"
            className="text-sm link-gold underline-offset-4 hover:underline"
          >
            Annals & assorted records →
          </Link>
        </div>
      )}
    </div>
  );
}
