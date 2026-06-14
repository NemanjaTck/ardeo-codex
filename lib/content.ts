import fs from "node:fs";
import path from "node:path";
import indexData from "@/content/index.json";
import { CATEGORIES, NAV_ITEMS, type CategoryKey } from "@/lib/taxonomy";

export interface Entry {
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

const ENTRIES = indexData as Entry[];
const CONTENT_DIR = path.join(process.cwd(), "content");

export function allEntries(): Entry[] {
  return ENTRIES;
}

export function entriesByCategory(category: string): Entry[] {
  return ENTRIES.filter((e) => e.category === category).sort(
    (a, b) =>
      (a.order ?? 9999) - (b.order ?? 9999) || a.title.localeCompare(b.title)
  );
}

/** Settlements + villages combined (for the merged "Settlements" page). */
export function settlementsAndVillages(): Entry[] {
  return [...entriesByCategory("settlements"), ...entriesByCategory("villages")];
}

export function getEntry(category: string, slug: string): Entry | undefined {
  return ENTRIES.find((e) => e.category === category && e.slug === slug);
}

export function entryBody(category: string, slug: string): string {
  const file = path.join(CONTENT_DIR, category, `${slug}.md`);
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

/** Category keys that actually have at least one entry, preserving taxonomy order. */
export function categoriesPresent(): CategoryKey[] {
  const present = new Set(ENTRIES.map((e) => e.category));
  return (Object.keys(CATEGORIES) as CategoryKey[]).filter((k) =>
    present.has(k)
  );
}

export function countByCategory(category: string): number {
  return ENTRIES.filter((e) => e.category === category).length;
}

/** Nav items that surface at least one non-empty category, with a live count. */
export function navItemsPresent() {
  const present = new Set(ENTRIES.map((e) => e.category));
  return NAV_ITEMS.filter((item) =>
    item.coversCategories.some((c) => present.has(c))
  ).map((item) => ({
    ...item,
    count: item.coversCategories.reduce((n, c) => n + countByCategory(c), 0),
  }));
}

export interface AgeGroup {
  age: string;
  ageOrder: number;
  entries: Entry[];
}

/** Lore entries grouped by age, in chronological order — for the History reader. */
export function loreByAge(): AgeGroup[] {
  const groups = new Map<string, AgeGroup>();
  for (const e of ENTRIES.filter((e) => e.category === "lore")) {
    const age = e.age ?? "The Compendium";
    if (!groups.has(age))
      groups.set(age, { age, ageOrder: e.ageOrder, entries: [] });
    groups.get(age)!.entries.push(e);
  }
  const list = [...groups.values()];
  list.sort((a, b) => a.ageOrder - b.ageOrder || a.age.localeCompare(b.age));
  for (const g of list)
    g.entries.sort(
      (a, b) =>
        (a.order ?? 9999) - (b.order ?? 9999) || a.title.localeCompare(b.title)
    );
  return list;
}

/** Neighbouring entries in the same category (for prev / next navigation). */
export function siblings(category: string, slug: string) {
  const list = entriesByCategory(category);
  const i = list.findIndex((e) => e.slug === slug);
  return {
    prev: i > 0 ? list[i - 1] : undefined,
    next: i >= 0 && i < list.length - 1 ? list[i + 1] : undefined,
    siblings: list.filter((e) => e.slug !== slug).slice(0, 6),
  };
}
