// Read/write layer for codex content. Two interchangeable backends:
//   • github — used in production (Vercel). Saves commit to the repo; Vercel
//     redeploys and the live site updates a minute later.
//   • fs     — used locally (no GITHUB_TOKEN). Saves write straight to the
//     content/ files so you get instant feedback while testing.
// Both maintain content/<category>/<slug>.md AND content/index.json so the
// result is identical to a fresh vault sync.

import fs from "node:fs";
import path from "node:path";
import type { CategoryKey } from "@/lib/taxonomy";
import {
  buildEntryMeta,
  slugify,
  STUB_PLACEHOLDER,
  type StoredEntry,
} from "@/lib/entry-meta";
import {
  ghCommitFiles,
  ghGetFile,
  githubEnabled,
  type FileChange,
} from "@/lib/github";

const CONTENT_DIR = path.join(process.cwd(), "content");
const INDEX_PATH = "content/index.json";

function useGithub(): boolean {
  if (process.env.CONTENT_BACKEND === "fs") return false;
  if (process.env.CONTENT_BACKEND === "github") return true;
  return githubEnabled();
}

// ---- low-level reads -----------------------------------------------------

async function readIndex(): Promise<StoredEntry[]> {
  if (useGithub()) {
    const file = await ghGetFile(INDEX_PATH);
    return file ? (JSON.parse(file.content) as StoredEntry[]) : [];
  }
  let text: string;
  try {
    text = fs.readFileSync(path.join(process.cwd(), INDEX_PATH), "utf8");
  } catch (e) {
    // A genuinely missing index is an empty codex; anything else (e.g. a
    // permissions error) should surface, not silently reset the index.
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
  // Let a parse error throw so a save aborts rather than overwriting a
  // good-but-unreadable index with a near-empty one.
  return JSON.parse(text) as StoredEntry[];
}

async function readBody(category: string, slug: string): Promise<string | null> {
  const rel = `content/${category}/${slug}.md`;
  if (useGithub()) {
    const file = await ghGetFile(rel);
    return file ? file.content : null;
  }
  try {
    return fs.readFileSync(path.join(process.cwd(), rel), "utf8");
  } catch {
    return null;
  }
}

// ---- public API ----------------------------------------------------------

export async function listEntries(): Promise<StoredEntry[]> {
  return readIndex();
}

export async function readEntry(
  category: string,
  slug: string
): Promise<{ meta: StoredEntry; body: string } | null> {
  const index = await readIndex();
  const meta = index.find((e) => e.category === category && e.slug === slug);
  if (!meta) return null;
  const body = (await readBody(category, slug)) ?? "";
  return { meta, body };
}

export interface SaveInput {
  category: CategoryKey;
  title: string;
  body: string;
  age?: string | null;
  order?: string | null;
  domain?: string | null;
  /** Identity of the entry being edited (omit both for a new entry). */
  originalCategory?: string | null;
  originalSlug?: string | null;
  /** Optional slug override; otherwise derived from the title. */
  slug?: string | null;
}

function uniqueSlug(
  index: StoredEntry[],
  category: string,
  base: string,
  ignore?: { category: string; slug: string }
): string {
  const taken = new Set(
    index
      .filter(
        (e) =>
          e.category === category &&
          !(ignore && e.category === ignore.category && e.slug === ignore.slug)
      )
      .map((e) => e.slug)
  );
  const root = base || "entry";
  let slug = root;
  let i = 2;
  while (taken.has(slug)) slug = `${root}-${i++}`;
  return slug;
}

function sortIndex(index: StoredEntry[]): StoredEntry[] {
  return [...index].sort(
    (a, b) =>
      a.category.localeCompare(b.category) ||
      (a.ageOrder ?? 99) - (b.ageOrder ?? 99) ||
      (a.order ?? 9999) - (b.order ?? 9999) ||
      a.title.localeCompare(b.title)
  );
}

/** Create or update an entry. Returns the resulting category + slug. */
export async function saveEntry(
  input: SaveInput
): Promise<{ category: string; slug: string }> {
  const index = await readIndex();
  const title = input.title.trim();
  if (!title) throw new Error("A title is required.");

  // Only treat this as an edit when the claimed original actually exists in the
  // index. A stale/garbage original (e.g. concurrent rename) falls back to a
  // create, so we never enqueue a delete for a file that isn't there.
  const editing =
    input.originalCategory &&
    input.originalSlug &&
    index.some(
      (e) =>
        e.category === input.originalCategory && e.slug === input.originalSlug
    )
      ? { category: input.originalCategory, slug: input.originalSlug }
      : null;

  const base = slugify(input.slug?.trim() || title);
  const slug = uniqueSlug(index, input.category, base, editing ?? undefined);

  const body = input.body.trim() ? input.body : STUB_PLACEHOLDER;
  const meta = buildEntryMeta({
    category: input.category,
    slug,
    title,
    body,
    age: input.age ?? null,
    order: input.order ?? null,
    domain: input.domain ?? null,
  });

  // Rebuild the index: drop the old identity and any clashing target, add new.
  let next = index.filter(
    (e) =>
      !(e.category === input.category && e.slug === slug) &&
      !(editing && e.category === editing.category && e.slug === editing.slug)
  );
  next.push(meta);
  next = sortIndex(next);

  const changes: FileChange[] = [
    { path: `content/${input.category}/${slug}.md`, content: body },
    { path: INDEX_PATH, content: JSON.stringify(next, null, 2) },
  ];
  // Moved or renamed → delete the old markdown file.
  if (editing && !(editing.category === input.category && editing.slug === slug)) {
    changes.push({
      path: `content/${editing.category}/${editing.slug}.md`,
      content: null,
    });
  }

  await applyChanges(changes, `codex: save "${title}" (${input.category})`);
  return { category: input.category, slug };
}

export async function deleteEntry(
  category: string,
  slug: string
): Promise<void> {
  const index = await readIndex();
  const entry = index.find((e) => e.category === category && e.slug === slug);
  const next = index.filter(
    (e) => !(e.category === category && e.slug === slug)
  );
  const changes: FileChange[] = [
    { path: `content/${category}/${slug}.md`, content: null },
    { path: INDEX_PATH, content: JSON.stringify(next, null, 2) },
  ];
  await applyChanges(
    changes,
    `codex: delete "${entry?.title ?? slug}" (${category})`
  );
}

// ---- write dispatch ------------------------------------------------------

async function applyChanges(changes: FileChange[], message: string) {
  if (useGithub()) {
    await ghCommitFiles(changes, message);
    return;
  }
  for (const ch of changes) {
    const abs = path.join(process.cwd(), ch.path);
    if (ch.content === null) {
      try {
        fs.unlinkSync(abs);
      } catch {
        /* already gone */
      }
    } else {
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, ch.content, "utf8");
    }
  }
}

/** Whether saves persist to GitHub (true) or the local filesystem (false). */
export function isGithubBackend(): boolean {
  return useGithub();
}

export { CONTENT_DIR };
