#!/usr/bin/env node
/**
 * sync-vault.mjs
 * --------------
 * Reads the chosen folders from the Obsidian "Ardeo" vault, normalizes each
 * note (derives a title, slug, category; resolves [[wikilinks]]; strips broken
 * image embeds) and writes:
 *   - content/<category>/<slug>.md   (clean markdown body)
 *   - content/index.json             (metadata for every entry)
 *   - public/search-index.json       (lightweight client search index)
 *
 * The vault path is taken from the VAULT_PATH env var, otherwise it assumes the
 * app lives one level inside the vault (……/Ardeo/ardeo-codex) and uses ".."
 *
 * To change what is published, edit SOURCES / SINGLE_FILES below.
 */

import fs from "node:fs";
import path from "node:path";

const APP_ROOT = process.cwd();
const VAULT_PATH = process.env.VAULT_PATH
  ? path.resolve(process.env.VAULT_PATH)
  : path.resolve(APP_ROOT, "..");

const CONTENT_DIR = path.join(APP_ROOT, "content");
const PUBLIC_DIR = path.join(APP_ROOT, "public");

// ---- What gets published -------------------------------------------------
// Each source maps a vault folder to a codex category. Add a line to publish
// more (e.g. { dir: "Bestiary", category: "bestiary" }).
const SOURCES = [
  { dir: "Gazetteer/Settlements", category: "settlements" },
  { dir: "Gazetteer/Villages", category: "villages" },
  { dir: "Gazetteer/Nature", category: "nature" },
  { dir: "Gazetteer/Regions", category: "regions" },
  { dir: "The World/Regions", category: "regions", recursive: true },
  { dir: "Gazetteer/Factions", category: "factions" },
  { dir: "Gazetteer/Organizations", category: "organizations" },
  { dir: "Races", category: "races" },
  { dir: "NPCs Public", category: "characters" },
  { dir: "Lore", category: "lore", recursive: true, ordered: true, ages: true },
  { dir: "History", category: "history", recursive: true },
  { dir: "The World/Alcohol", category: "culture" },
  { dir: "The World/Weather", category: "culture" },
  { dir: "Resources", category: "resources" },
  { dir: "Campaigns/Zenari Artifact", category: "chronicles", ordered: true },
];

const SINGLE_FILES = [
  { file: "Timeline.md", category: "history", title: "Timeline" },
];

const GODS_LIST_FILE = "Gods.md";
const GODS_DIR = "Gods";

const SKIP_BASENAMES = new Set(["Untitled"]);
const STUB_PLACEHOLDER =
  "_This entry awaits its chronicler. Its tale has yet to be set down._";

// ---- Helpers -------------------------------------------------------------
function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function slugify(input) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function walk(dir, recursive) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (recursive) out.push(...walk(full, true));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

function deriveTitle(baseName, ordered) {
  let title = baseName.replace(/\.md$/i, "");
  let order = null;
  if (ordered) {
    const m = title.match(/^(\d+(?:\.\d+)?)[.)]?\s+(.*)$/);
    if (m) {
      order = parseFloat(m[1]);
      title = m[2];
    }
    const ch = title.match(/^Chapter\s+(\d+)/i);
    if (ch) order = parseInt(ch[1], 10);
  }
  return { title: title.trim(), order };
}

function cleanAgeName(folderName) {
  const m = folderName.match(/^(\d+)\.\s*(.*)$/);
  if (m) return { name: m[2].trim(), order: parseInt(m[1], 10) };
  return { name: folderName.trim(), order: 99 };
}

// Strip markdown to roughly-plain text for excerpts and the search index.
function toPlain(md) {
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

function excerptOf(md, len = 240) {
  const plain = toPlain(md);
  if (plain.length <= len) return plain;
  return plain.slice(0, len).replace(/\s+\S*$/, "") + "…";
}

// ---- Pass 1: collect every entry ----------------------------------------
const raw = []; // { category, title, slug, order, age, ageOrder, body, sourcePath }
const slugSets = new Map(); // category -> Set(slug)
const titleMap = new Map(); // lowercased title/slug -> { category, slug }

function uniqueSlug(category, base) {
  if (!slugSets.has(category)) slugSets.set(category, new Set());
  const set = slugSets.get(category);
  let slug = base || "entry";
  let i = 2;
  while (set.has(slug)) slug = `${base}-${i++}`;
  set.add(slug);
  return slug;
}

function register(entry) {
  raw.push(entry);
  const ref = { category: entry.category, slug: entry.slug };
  const tkey = entry.title.toLowerCase();
  if (!titleMap.has(tkey)) titleMap.set(tkey, ref);
  if (!titleMap.has(entry.slug)) titleMap.set(entry.slug, ref);
}

function addFile(file, category, opts) {
  const baseName = path.basename(file);
  const noExt = baseName.replace(/\.md$/i, "");
  if (SKIP_BASENAMES.has(noExt)) return;
  const { title, order } = deriveTitle(baseName, opts.ordered);
  const body = fs.readFileSync(file, "utf8");

  let age = null;
  let ageOrder = 99;
  if (opts.ages) {
    const rel = path.relative(path.join(VAULT_PATH, opts.dir), file);
    const parts = rel.split(path.sep);
    if (parts.length > 1) {
      const a = cleanAgeName(parts[0]);
      age = a.name;
      ageOrder = a.order;
    } else {
      age = "The Compendium";
      ageOrder = 98;
    }
  }

  const slug = uniqueSlug(category, slugify(title));
  register({ category, title, slug, order, age, ageOrder, body, sourcePath: file });
}

for (const src of SOURCES) {
  const abs = path.join(VAULT_PATH, src.dir);
  const files = walk(abs, !!src.recursive);
  for (const f of files) addFile(f, src.category, src);
}

for (const sf of SINGLE_FILES) {
  const abs = path.join(VAULT_PATH, sf.file);
  if (!fs.existsSync(abs)) continue;
  const body = fs.readFileSync(abs, "utf8");
  const slug = uniqueSlug(sf.category, slugify(sf.title));
  register({
    category: sf.category,
    title: sf.title,
    slug,
    order: null,
    age: null,
    ageOrder: 99,
    body,
    sourcePath: abs,
  });
}

// ---- Gods: list file + detail folder ------------------------------------
const godsListPath = path.join(VAULT_PATH, GODS_LIST_FILE);
const godBodies = new Map(); // slug -> body (from detail files)
const godsDirAbs = path.join(VAULT_PATH, GODS_DIR);
if (fs.existsSync(godsDirAbs)) {
  for (const f of walk(godsDirAbs, false)) {
    const noExt = path.basename(f).replace(/\.md$/i, "");
    const name = noExt.split(/\s+[-–—]\s+/)[0].trim();
    const body = fs.readFileSync(f, "utf8");
    if (toPlain(body).length > 20) godBodies.set(slugify(name), body);
  }
}
if (fs.existsSync(godsListPath)) {
  const lines = fs.readFileSync(godsListPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^[-*]\s*(.+?)\s+[-–—]\s+(.+?)\s*$/);
    if (!m) continue;
    const name = m[1].trim();
    const domain = m[2].trim().replace(/\.$/, "");
    const slug = uniqueSlug("gods", slugify(name));
    const detail = godBodies.get(slugify(name));
    const body = detail
      ? detail
      : `A deity of the Ardeo pantheon.\n\n**Domain.** ${cap(domain)}.`;
    register({
      category: "gods",
      title: name,
      slug,
      order: null,
      age: null,
      ageOrder: 99,
      body,
      sourcePath: godsListPath,
      meta: { domain },
    });
  }
}

// ---- Pass 2: transform bodies & resolve links ---------------------------
function resolveLinks(md) {
  let out = md;
  // remove obsidian image embeds (broken local refs) and external images
  out = out.replace(/!\[\[[^\]]*\]\]/g, "");
  out = out.replace(/!\[[^\]]*\]\([^)]*\)/g, "");
  // obsidian comments, callout markers, and dataview inline fields
  out = out.replace(/%%[^]*?%%/g, "");
  out = out.replace(/^>\s*\[![a-zA-Z]+\][-+]?\s*/gm, "> ");
  out = out.replace(/\[([^\]:]+)::\s*([^\]]*)\]/g, (_m, k, v) =>
    v.trim() ? `**${cap(k.trim())}:** ${v.trim()}` : ""
  );
  // [[target|label]] and [[target]]
  out = out.replace(/\[\[([^\]]+)\]\]/g, (_m, inner) => {
    let target = inner;
    let label = inner;
    const pipe = inner.indexOf("|");
    if (pipe !== -1) {
      target = inner.slice(0, pipe);
      label = inner.slice(pipe + 1);
    }
    // drop image embeds that slipped through / size-only labels
    if (/\.(png|jpe?g|gif|webp|svg)$/i.test(target)) return "";
    const base = target.split("/").pop().replace(/\.md$/i, "").trim();
    const ref = titleMap.get(base.toLowerCase());
    label = label.trim();
    if (ref) return `[${label}](/codex/${ref.category}/${ref.slug}/)`;
    return label; // unresolved → plain text
  });
  // tidy whitespace
  out = out.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+$/gm, "").trim();
  return out;
}

// Safety: never wipe a committed content/ snapshot if the vault wasn't found.
if (raw.length === 0) {
  console.error(`\n  ✖ No notes found under ${VAULT_PATH}`);
  console.error(
    `    Point VAULT_PATH at your Ardeo vault, or run this from inside it.`
  );
  console.error(`    (Refusing to overwrite existing content/.)\n`);
  process.exit(1);
}

fs.rmSync(CONTENT_DIR, { recursive: true, force: true });
fs.mkdirSync(CONTENT_DIR, { recursive: true });

const index = [];
const searchIndex = [];

for (const e of raw) {
  let body = resolveLinks(e.body);
  const isStub = toPlain(body).length < 40;
  if (isStub) body = STUB_PLACEHOLDER;

  const dir = path.join(CONTENT_DIR, e.category);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${e.slug}.md`), body, "utf8");

  const excerpt = isStub
    ? "An entry yet to be written."
    : excerptOf(body);
  const url = `/codex/${e.category}/${e.slug}/`;

  index.push({
    slug: e.slug,
    title: e.title,
    category: e.category,
    url,
    order: e.order,
    age: e.age,
    ageOrder: e.ageOrder,
    stub: isStub,
    excerpt,
    ...(e.meta || {}),
  });

  searchIndex.push({
    slug: e.slug,
    title: e.title,
    category: e.category,
    url,
    excerpt,
    body: toPlain(body).slice(0, 1600),
    stub: isStub,
  });
}

// stable sort: by category, then order (if any), then title
index.sort(
  (a, b) =>
    a.category.localeCompare(b.category) ||
    (a.ageOrder ?? 99) - (b.ageOrder ?? 99) ||
    (a.order ?? 9999) - (b.order ?? 9999) ||
    a.title.localeCompare(b.title)
);

fs.writeFileSync(
  path.join(CONTENT_DIR, "index.json"),
  JSON.stringify(index, null, 2),
  "utf8"
);
fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.writeFileSync(
  path.join(PUBLIC_DIR, "search-index.json"),
  JSON.stringify(searchIndex),
  "utf8"
);

// ---- Report --------------------------------------------------------------
const byCat = {};
let stubs = 0;
for (const e of index) {
  byCat[e.category] = (byCat[e.category] || 0) + 1;
  if (e.stub) stubs++;
}
console.log(`\n  Ardeo codex — vault sync`);
console.log(`  vault: ${VAULT_PATH}`);
console.log(`  entries: ${index.length}  (stubs to flesh out: ${stubs})`);
for (const [cat, n] of Object.entries(byCat).sort())
  console.log(`    ${String(n).padStart(3)}  ${cat}`);
console.log("");
