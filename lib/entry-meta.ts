// Helpers for turning an edited entry into the metadata shape stored in
// content/index.json. This MUST stay in sync with scripts/sync-vault.mjs so a
// backoffice save produces the same index a fresh vault sync would.

import type { CategoryKey } from "@/lib/taxonomy";

export interface StoredEntry {
  slug: string;
  title: string;
  category: CategoryKey;
  url: string;
  order: number | null;
  age: string | null;
  ageOrder: number;
  stub: boolean;
  excerpt: string;
  domain?: string;
}

/** The chronological ages of Ardeo, in order. Drives the History page. */
export const AGES: { name: string; order: number }[] = [
  { name: "Before life", order: 0 },
  { name: "Age of Prosperity", order: 1 },
  { name: "Age of Elements", order: 2 },
  { name: "Age of Peace", order: 3 },
  { name: "The Compendium", order: 98 },
];

export function ageOrderFor(age: string | null | undefined): number {
  if (!age) return 99;
  const hit = AGES.find((a) => a.name.toLowerCase() === age.toLowerCase());
  return hit ? hit.order : 97;
}

/**
 * Turn a "2.14"-style chapter label into a single sortable number that keeps
 * 2.2 < 2.10 < 2.14 (the old code used parseFloat, which broke this). Major and
 * minor are combined as major*1000 + minor, so up to 999 entries per age.
 */
export function parseOrder(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined || input === "") return null;
  if (typeof input === "number") return input;
  const m = String(input).trim().match(/^(\d+)(?:\.(\d+))?/);
  if (!m) return null;
  const major = parseInt(m[1], 10);
  const minor = m[2] ? parseInt(m[2], 10) : 0;
  return major * 1000 + minor;
}

/** Inverse of parseOrder, for showing the friendly "2.14" form in the editor. */
export function formatOrder(order: number | null | undefined): string {
  if (order === null || order === undefined) return "";
  const major = Math.floor(order / 1000);
  const minor = order % 1000;
  return minor ? `${major}.${minor}` : String(major);
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/**
 * Strip markdown to rough plain text for excerpts / stub detection.
 * This MUST mirror toPlain() in scripts/sync-vault.mjs so a backoffice save and
 * a fresh vault sync compute the same excerpt/stub — including Obsidian
 * wikilinks (`[[a]]`, `[[a|b]]`) and dataview inline fields (`[k:: v]`).
 */
export function toPlain(md: string): string {
  return md
    .replace(/!\[\[[^\]]*\]\]/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/%%[^]*?%%/g, " ")
    .replace(/\[([^\]:]+)::\s*([^\]]*)\]/g, "$1 $2")
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s*\|.*\|\s*$/gm, " ")
    .replace(/[#>*_`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerptOf(md: string, len = 240): string {
  const plain = toPlain(md);
  if (plain.length <= len) return plain;
  return plain.slice(0, len).replace(/\s+\S*$/, "") + "…";
}

const STUB_LEN = 40;
export function isStub(md: string): boolean {
  return toPlain(md).length < STUB_LEN;
}

export const STUB_PLACEHOLDER =
  "_This entry awaits its chronicler. Its tale has yet to be set down._";

export interface BuildMetaInput {
  category: CategoryKey;
  slug: string;
  title: string;
  body: string;
  age?: string | null;
  order?: string | number | null;
  domain?: string | null;
}

/** Build the content/index.json record for one entry. */
export function buildEntryMeta(input: BuildMetaInput): StoredEntry {
  const stub = isStub(input.body);
  const age = input.age && input.age.trim() ? input.age.trim() : null;
  const meta: StoredEntry = {
    slug: input.slug,
    title: input.title,
    category: input.category,
    url: `/codex/${input.category}/${input.slug}/`,
    order: parseOrder(input.order ?? null),
    age,
    ageOrder: ageOrderFor(age),
    stub,
    excerpt: stub ? "An entry yet to be written." : excerptOf(input.body),
  };
  if (input.domain && input.domain.trim()) meta.domain = input.domain.trim();
  return meta;
}
