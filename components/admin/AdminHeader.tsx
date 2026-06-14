import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminHeader({ title }: { title: string }) {
  return (
    <header className="mb-8 flex items-center justify-between gap-3 border-b border-edge/70 pb-4">
      <div className="flex items-baseline gap-3">
        <Link
          href="/admin/"
          className="font-display text-lg tracking-[0.18em] text-gold hover:text-gold-bright"
        >
          ✦ Backoffice
        </Link>
        <span className="text-parchment-faint">/</span>
        <span className="font-display text-base text-parchment-soft">
          {title}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.14em] text-parchment-faint hover:text-gold"
        >
          View site
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
}
