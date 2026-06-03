import type { SigilKey } from "@/lib/taxonomy";

const PATHS: Record<SigilKey, React.ReactNode> = {
  keep: (
    <>
      <path d="M4 21V9l2-2V4h2v2h2V4h2v2h2V4h2v3l2 2v12" />
      <path d="M4 21h16M9 21v-4a3 3 0 0 1 6 0v4" />
    </>
  ),
  hamlet: (
    <>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  peak: (
    <>
      <path d="M3 19h18L14 6l-3.5 6L8 9z" />
      <path d="M12 9.5 13.4 12" />
    </>
  ),
  map: (
    <>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  banner: (
    <>
      <path d="M6 3v18" />
      <path d="M6 4h12l-2.5 4L18 12H6" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  folk: (
    <>
      <circle cx="8.5" cy="8" r="2.6" />
      <circle cx="16" cy="9" r="2.2" />
      <path d="M3.5 20c0-3 2.2-5 5-5s5 2 5 5" />
      <path d="M13.8 20c.2-2.4 1.8-4.2 4.2-4.2 1.6 0 3 .8 3.8 2" />
    </>
  ),
  portrait: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <circle cx="12" cy="10" r="2.7" />
      <path d="M7.5 18c.6-2.4 2.4-3.6 4.5-3.6S15.9 15.6 16.5 18" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </>
  ),
  scroll: (
    <>
      <path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2z" />
      <path d="M6 4a2 2 0 0 0-2 2v1h3M9 9h7M9 13h7" />
    </>
  ),
  goblet: (
    <>
      <path d="M7 4h10l-1 6a4 4 0 0 1-8 0z" />
      <path d="M12 14v4M8 21h8M10 21c0-1.6.9-3 2-3s2 1.4 2 3" />
    </>
  ),
  gem: (
    <>
      <path d="M6 3h12l3 6-9 12L3 9z" />
      <path d="M3 9h18M9 3 6 9l6 12 6-12-3-6" />
    </>
  ),
  book: (
    <>
      <path d="M12 6v15" />
      <path d="M12 6C10 4.5 7 4 4 4.5v14C7 18 10 18.5 12 20c2-1.5 5-2 8-1.5v-14C17 4 14 4.5 12 6z" />
    </>
  ),
};

export default function CategorySigil({
  sigil,
  className = "",
  size = 24,
}: {
  sigil: SigilKey;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[sigil]}
    </svg>
  );
}
