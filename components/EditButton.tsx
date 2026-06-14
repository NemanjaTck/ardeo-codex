"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/components/useAdminAuth";

/** A small "Edit" / "New" link that only appears when an admin is logged in. */
export default function EditButton({
  href,
  label = "Edit",
}: {
  href: string;
  label?: string;
}) {
  const authed = useAdminAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !authed) return null;
  return (
    <Link
      href={href}
      className="badge transition-colors hover:border-gold hover:text-gold-bright"
    >
      ✎ {label}
    </Link>
  );
}
