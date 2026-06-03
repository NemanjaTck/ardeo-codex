import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { loreByAge, entriesByCategory } from "@/lib/content";

export const metadata: Metadata = {
  title: "History of Ardeo",
  description:
    "The ages of the world set in order — from the creation to the present peace.",
};

export default function HistoryPage() {
  const ages = loreByAge();
  const annals = entriesByCategory("history");

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
          chronicle of all that has come to pass.
        </p>
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
                    className="panel group block p-4 transition-colors hover:border-gold-deep/70 hover:bg-ink-600/70"
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
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      {annals.length > 0 && (
        <section className="mt-16 border-t border-edge/60 pt-8">
          <h2 className="mb-4 font-display text-xl tracking-wide text-parchment">
            Annals & Records
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {annals.map((e) => (
              <li key={e.slug}>
                <Link
                  href={e.url}
                  className="panel block p-4 transition-colors hover:border-gold-deep/70 hover:text-gold"
                >
                  <span className="font-display text-parchment hover:text-gold">
                    {e.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
