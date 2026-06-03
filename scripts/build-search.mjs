#!/usr/bin/env node
/**
 * build-search.mjs
 * ----------------
 * Builds public/search-index.json from the committed content/ snapshot.
 * Unlike sync-vault.mjs this needs NO access to the Obsidian vault, so it can
 * run anywhere — including on Vercel during `next build`.
 */

import fs from "node:fs";
import path from "node:path";

const APP_ROOT = process.cwd();
const CONTENT_DIR = path.join(APP_ROOT, "content");
const PUBLIC_DIR = path.join(APP_ROOT, "public");

function toPlain(md) {
  return md
    .replace(/!\[\[[^\]]*\]\]/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]|]+)\|([^\]]+)\]/g, "$2")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s*\|.*\|\s*$/gm, " ")
    .replace(/[#>*_`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const indexPath = path.join(CONTENT_DIR, "index.json");
if (!fs.existsSync(indexPath)) {
  console.error(
    "\n  ✖ content/index.json not found. Run `npm run sync` first to build it from the vault.\n"
  );
  process.exit(1);
}

const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const search = index.map((e) => {
  let body = "";
  try {
    body = fs.readFileSync(path.join(CONTENT_DIR, e.category, `${e.slug}.md`), "utf8");
  } catch {}
  return {
    slug: e.slug,
    title: e.title,
    category: e.category,
    url: e.url,
    excerpt: e.excerpt,
    body: toPlain(body).slice(0, 1600),
    stub: e.stub,
  };
});

fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.writeFileSync(
  path.join(PUBLIC_DIR, "search-index.json"),
  JSON.stringify(search)
);
console.log(`  search index: ${search.length} entries`);
