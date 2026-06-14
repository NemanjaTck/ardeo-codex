"use client";

import { useRouter } from "next/navigation";
import { clearAdminAuth } from "@/components/useAdminAuth";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearAdminAuth();
    router.push("/admin/login/");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="text-xs uppercase tracking-[0.14em] text-parchment-faint hover:text-gold"
    >
      Log out
    </button>
  );
}
