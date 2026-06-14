import Link from "next/link";
import CategorySigil from "@/components/CategorySigil";
import { navItemsPresent } from "@/lib/content";

export default function Footer() {
  const items = navItemsPresent();
  return (
    <footer className="mt-20 border-t border-edge/70 bg-ink-800/60">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <ul className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm sm:grid-cols-4">
          {items.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className="group inline-flex items-center gap-2 text-parchment-muted transition-colors hover:text-gold"
              >
                <span className="text-gold-deep group-hover:text-gold">
                  <CategorySigil sigil={item.sigil} size={16} />
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
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
