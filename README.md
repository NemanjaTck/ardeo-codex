# Ardeo Codex

An encyclopedia of the world of **Ardeo** — its realms, peoples, factions,
gods, and history — built from the Obsidian vault and deployable to Vercel.

Built with **Next.js 16** (App Router, Turbopack) + React 19 + Tailwind. No
database. The public pages are statically generated; a small password-gated
**backoffice** (`/admin`) lets you add and edit entries from any device —
phone included. Requires **Node.js 20.9+**.

There are now **two** ways content changes:

1. **Vault sync** (on your laptop) — `npm run sync` pulls the latest notes from
   the Obsidian vault into `content/`. The canonical bulk import.
2. **Backoffice** (from anywhere) — log in at `/admin`, edit or create entries.
   In production each save **commits to this GitHub repo**, which triggers
   Vercel to rebuild and publish (~1 minute later). Locally (no GitHub token)
   saves write straight to the `content/` files for instant feedback.

> Heads-up: a later `npm run sync` regenerates `content/` from the vault and
> will overwrite backoffice edits that aren't also in the vault. When you get
> back from editing on the go, `git pull` the committed edits before syncing.

---

## How it works

```
Obsidian vault  ──[ npm run sync ]──►  content/  ──[ npm run build ]──►  Vercel
   (private)              ▲             (committed)                   (Next.js app)
                          │
                  backoffice saves  (commit to GitHub → Vercel rebuilds)
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

## The backoffice (editing from your phone)

Visit **`/admin`**, log in, and you get a mobile-first editor: search/filter
every entry, edit any of them (there are also ✎ pencils on the live pages when
you're logged in), add new ones, or delete. Lore entries expose **Age** +
**Order** (e.g. `2.14`) so the History timeline stays in chronological order.

Configure it with environment variables (see **`.env.example`**):

| Var | What it does |
| --- | --- |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | The login you type at `/admin/login`. |
| `SESSION_SECRET` | Signs the login cookie (any long random string). |
| `GITHUB_TOKEN` | A token with **Contents: read/write** on this repo. When set, saves commit to the repo (→ Vercel rebuilds). Leave unset locally to write to files directly. |
| `GITHUB_REPO`, `GITHUB_BRANCH` | Defaults to `NemanjaTck/ardeo-codex` / `main`. |

Local editing test: `ADMIN_USERNAME=me ADMIN_PASSWORD=pw npm run dev`, then
open `http://localhost:3000/admin`.

---

## Deploy to Vercel (via GitHub)

1. Push this repo to GitHub (the remote is already `NemanjaTck/ardeo-codex`):
   ```bash
   git add . && git commit -m "Backoffice + restructure" && git push
   ```
2. Go to **vercel.com → Add New → Project → Import** your repo.
3. Vercel auto-detects Next.js. Leave the build defaults and click **Deploy**.
4. In **Project → Settings → Environment Variables**, add the variables from the
   table above (at minimum `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`,
   `GITHUB_TOKEN`). Redeploy so they take effect.
5. Every `git push` — and every backoffice save — redeploys automatically.

To update the site after editing notes on the laptop: `npm run sync` →
`git commit` → `git push`.

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
