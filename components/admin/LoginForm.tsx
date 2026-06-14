"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAdminAuth } from "@/components/useAdminAuth";

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setAdminAuth(true);
      router.push(next || "/admin/");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="admin-label">Username</label>
        <input
          className="admin-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoCapitalize="none"
          autoComplete="username"
        />
      </div>
      <div>
        <label className="admin-label">Password</label>
        <input
          type="password"
          className="admin-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      {error && (
        <p className="rounded-sm border border-blood/60 bg-blood/15 px-4 py-2.5 text-sm text-ember">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="btn-gold w-full">
        {busy ? "Entering…" : "Enter"}
      </button>
    </form>
  );
}
