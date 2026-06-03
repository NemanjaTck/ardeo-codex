# Ardeo Codex

A static encyclopedia of the world of **Ardeo** — its realms, peoples, factions,
gods, and history — built from the Obsidian vault and deployable to Vercel.

Built with **Next.js 16** (App Router, Turbopack, static export) + React 19 +
Tailwind. No database, no server. Requires **Node.js 20.9+**.

---

## How it works

```
Obsidian vault  ──[ npm run sync ]──►  content/  ──[ npm run build ]──►  out/  ──► Vercel
   (private)                          (committed)                      (static site)
```

1. **`npm run sync`** reads the chosen folders from your vault, cleans each note
   (derives a title + slug, resolves `[[wikilinks]]`, strips broken image
   embeds and Obsidian/Dataview syntax) and writes the normalized result to
   **`content/`**.
2. **`content/` is committed to git.** It is the published snapshot. Your vault
   never leaves your machine — only the cleaned public content does.
3. **`npm run build`** turns `content/` into a fully static site in `out/`.
   This step needs no vault, so it runs on Vercel.

---

## Quick start

```bash
npm install
npm run sync     # only when your notes changed (needs the vault)
npm run dev      # http://localhost:3000
```

> The app expects to live **inside** the Ardeo vault folder (one level down),
> so `npm run sync` finds the notes automatically. If you move it elsewhere,
> point it at the vault:
> ```bash
> VAULT_PATH="/path/to/.../ardeo-world/Ardeo" npm run sync
> ```

---

## Changing what gets published

Open **`scripts/sync-vault.mjs`** and edit the `SOURCES` list near the top.
Each line maps a vault folder to a codex category, e.g.:

```js
{ dir: "Gazetteer/Settlements", category: "settlements" },
```

To publish the bestiary too, add `{ dir: "Bestiary", category: "bestiary" }`
(and add a matching entry in `lib/taxonomy.ts`). The `Campaigns/Secret` folder
and the pure rules mechanics are intentionally left out.

After editing, run `npm run sync` and commit the updated `content/`.

---

## Deploy to Vercel (via GitHub)

1. Create a new repository on GitHub (e.g. `ardeo-codex`).
2. From this folder:
   ```bash
   git init
   git add .
   git commit -m "Ardeo codex"
   git branch -M main
   git remote add origin git@github.com:<you>/ardeo-codex.git
   git push -u origin main
   ```
3. Go to **vercel.com → Add New → Project → Import** your repo.
4. Vercel auto-detects Next.js. Leave the defaults (Build `npm run build`,
   Output handled automatically) and click **Deploy**.
5. Every `git push` afterwards redeploys automatically.

To update the site after editing notes: `npm run sync` → `git commit` → `git push`.

---

## Project structure

```
app/                     routes (home, codex, category, entry, history, search)
components/              Nav, SearchClient, EntryCard, CategorySigil, Markdown …
lib/
  taxonomy.ts            categories + nav grouping (edit to add sections)
  content.ts             loads content/ for the pages
  markdown.ts            markdown → HTML
scripts/
  sync-vault.mjs         vault → content/  (run locally)
  build-search.mjs       content/ → search index  (runs on every build)
content/                 committed, generated snapshot of the public notes
```

---

## Notes

- **Images** are text-first for now: each entry shows a category sigil as a
  stand-in. Drop real images into `public/images/` and wire them up later.
- **Obsidian:** add `…/Ardeo/ardeo-codex` to *Settings → Files & Links →
  Excluded files* so the app's files don't clutter your vault search.
