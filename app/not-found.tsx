import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-32 text-center">
      <h1 className="font-display text-6xl text-gold">✦</h1>
      <h2 className="mt-6 font-display text-3xl tracking-wide text-parchment">
        Lost to the Mists
      </h2>
      <p className="mt-4 text-parchment-muted">
        This page has slipped from the codex, or was never written. Return to
        firmer ground.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-sm border border-gold-deep bg-gold-deep/15 px-5 py-2.5 font-display text-sm uppercase tracking-[0.18em] text-gold-bright transition-colors hover:bg-gold-deep/30"
        >
          Home
        </Link>
        <Link
          href="/codex/"
          className="rounded-sm border border-edge px-5 py-2.5 font-display text-sm uppercase tracking-[0.18em] text-parchment-soft transition-colors hover:border-gold-deep hover:text-gold"
        >
          The Codex
        </Link>
      </div>
    </div>
  );
}
