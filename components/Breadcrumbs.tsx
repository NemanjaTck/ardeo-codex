import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-parchment-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {item.href ? (
              <Link href={item.href} className="link-gold">
                {item.label}
              </Link>
            ) : (
              <span className="text-parchment-soft">{item.label}</span>
            )}
            {i < items.length - 1 && (
              <span className="text-gold-deep/60">›</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
