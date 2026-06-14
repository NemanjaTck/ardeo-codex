"use client";

import { useEffect, useState } from "react";

// Tiny cache so multiple Edit buttons on a page only hit /api/auth/me once.
let cached: boolean | null = null;
let inflight: Promise<boolean> | null = null;
const listeners = new Set<(v: boolean) => void>();

function load(): Promise<boolean> {
  if (cached !== null) return Promise.resolve(cached);
  if (inflight) return inflight;
  inflight = fetch("/api/auth/me")
    .then((r) => r.json())
    .then((d) => {
      cached = Boolean(d.authed);
      listeners.forEach((fn) => fn(cached!));
      return cached;
    })
    .catch(() => false)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Force the cached auth state (e.g. true right after a successful login). */
export function setAdminAuth(value: boolean): void {
  cached = value;
  inflight = null;
  listeners.forEach((fn) => fn(value));
}

/** Clear the cache so the next check re-fetches (call on logout). */
export function clearAdminAuth(): void {
  setAdminAuth(false);
}

/** Returns whether an admin is logged in (client-side check, cached). */
export function useAdminAuth(): boolean {
  const [authed, setAuthed] = useState<boolean>(cached ?? false);
  useEffect(() => {
    let active = true;
    const fn = (v: boolean) => active && setAuthed(v);
    listeners.add(fn);
    load().then((v) => active && setAuthed(v));
    return () => {
      listeners.delete(fn);
      active = false;
    };
  }, []);
  return authed;
}
