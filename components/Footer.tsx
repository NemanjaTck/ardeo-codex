import Link from "next/link";
import { sectionsPresent } from "@/lib/content";
import { CATEGORIES } from "@/lib/taxonomy";

export default function Footer() {
  const sections = sectionsPresent();
  return (
    <footer className="mt-20 border-t border-edge/70 bg-ink-800/60">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((s) => (
            <div key={s.key}>
              <h3 className="mb-3 font-display text-xs uppercase tracking-[0.2em] text-gold-deep">
                {s.label}
              </h3>
              <ul className="space-y-1.5 text-sm">
                {s.categories.map((c) => (
                  <li key={c}>
                    <Link
                      href={`/codex/${c}/`}
                      className="text-parchment-muted transition-colors hover:text-gold"
                    >
                      {CATEGORIES[c].label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center gap-2 border-t border-edge/50 pt-6 text-center">
          <span className="font-display text-sm tracking-[0.3em] text-gold-deep">
            ✦ ARDEO ✦
          </span>
          <p className="text-xs text-parchment-faint">
            A codex of the world. Compiled from the chronicles of its makers.
          </p>
        </div>
      </div>
    </footer>
  );
}
