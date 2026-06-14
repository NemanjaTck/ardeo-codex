"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import {
  CATEGORIES,
  EDITABLE_CATEGORIES,
  type CategoryKey,
} from "@/lib/taxonomy";
import { AGES, formatOrder } from "@/lib/entry-meta";

export interface EditorInitial {
  category: CategoryKey;
  slug: string;
  title: string;
  body: string;
  age?: string | null;
  order?: number | null;
  domain?: string | null;
}

export default function EntryEditor({
  mode,
  initial,
  defaultCategory,
}: {
  mode: "new" | "edit";
  initial?: EditorInitial;
  defaultCategory?: CategoryKey;
}) {
  const router = useRouter();

  const [category, setCategory] = useState<CategoryKey>(
    initial?.category ?? defaultCategory ?? "settlements"
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [age, setAge] = useState(initial?.age ?? "Before life");
  const [order, setOrder] = useState(formatOrder(initial?.order ?? null));
  const [domain, setDomain] = useState(initial?.domain ?? "");
  const [body, setBody] = useState(initial?.body ?? "");

  const [showPreview, setShowPreview] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ url: string; backend: string } | null>(
    null
  );

  const isLore = category === "lore";
  const isGod = category === "gods";

  const previewHtml = useMemo(
    () => (showPreview ? (marked.parse(body || "") as string) : ""),
    [showPreview, body]
  );

  async function onSave() {
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title,
          slug: slug || undefined,
          age: isLore ? age : null,
          order: isLore ? order : null,
          domain: isGod ? domain : null,
          originalCategory: mode === "edit" ? initial?.category : undefined,
          originalSlug: mode === "edit" ? initial?.slug : undefined,
          body,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setDone({ url: data.url, backend: data.backend });
      // Keep the editor on the saved entry (so slug/identity stays correct).
      if (data.category && data.slug) {
        router.replace(`/admin/edit/${data.category}/${data.slug}/`);
        router.refresh();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!initial) return;
    if (!confirm(`Delete “${initial.title}”? This cannot be undone here.`))
      return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: initial.category,
          slug: initial.slug,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      router.push("/admin/");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 pb-28">
      {/* Category */}
      <div>
        <label className="admin-label">Section</label>
        <select
          className="admin-select"
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryKey)}
        >
          {EDITABLE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORIES[c].label}
              {c === "lore" ? " (chronological ages)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="admin-label">Title</label>
        <input
          className="admin-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Name of the entry…"
        />
      </div>

      {/* Lore: age + order */}
      {isLore && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="admin-label">Age</label>
            <select
              className="admin-select"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            >
              {AGES.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label">Order (e.g. 2.14)</label>
            <input
              className="admin-input"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              placeholder="2.14"
              inputMode="decimal"
            />
          </div>
        </div>
      )}

      {/* Gods: domain */}
      {isGod && (
        <div>
          <label className="admin-label">Domain (optional)</label>
          <input
            className="admin-input"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="War, the harvest, the deep…"
          />
        </div>
      )}

      {/* Body + preview */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="admin-label mb-0">Body (Markdown)</label>
          <button
            type="button"
            onClick={() => setShowPreview((p) => !p)}
            className="text-xs uppercase tracking-[0.14em] text-parchment-faint hover:text-gold"
          >
            {showPreview ? "Write" : "Preview"}
          </button>
        </div>
        {showPreview ? (
          <div
            className="prose prose-grimoire prose-invert max-w-none rounded-sm border border-edge bg-ink-700/40 px-4 py-3"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <textarea
            className="admin-textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Set down the tale in Markdown…"
          />
        )}
      </div>

      {/* Advanced: slug */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced((a) => !a)}
          className="text-xs uppercase tracking-[0.14em] text-parchment-faint hover:text-gold"
        >
          {showAdvanced ? "− Advanced" : "+ Advanced"}
        </button>
        {showAdvanced && (
          <div className="mt-3">
            <label className="admin-label">
              URL slug {mode === "new" && "(leave blank to auto-generate)"}
            </label>
            <input
              className="admin-input"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto from title"
            />
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-sm border border-blood/60 bg-blood/15 px-4 py-3 text-sm text-ember">
          {error}
        </p>
      )}
      {done && (
        <p className="rounded-sm border border-gold-deep/60 bg-gold-deep/10 px-4 py-3 text-sm text-parchment-soft">
          Saved.{" "}
          {done.backend === "github"
            ? "Committed to GitHub — the live site will update in about a minute."
            : "Written to local content."}{" "}
          <a className="link-gold underline" href={done.url}>
            View entry →
          </a>
        </p>
      )}

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-edge/70 bg-ink-900/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            onClick={onSave}
            disabled={busy || !title.trim()}
            className="btn-gold flex-1"
          >
            {busy ? "Saving…" : mode === "new" ? "Create" : "Save"}
          </button>
          {mode === "edit" && (
            <button onClick={onDelete} disabled={busy} className="btn-danger">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
