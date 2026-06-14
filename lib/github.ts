// Minimal GitHub commit layer. Used in production (Vercel) so a backoffice
// "Save" becomes a real commit to the content repo — which triggers Vercel to
// rebuild and publish. No git binary required; everything goes through the
// GitHub REST API with a personal access token.

const API = "https://api.github.com";

function repo(): string {
  return process.env.GITHUB_REPO || "NemanjaTck/ardeo-codex";
}
function branch(): string {
  return process.env.GITHUB_BRANCH || "main";
}
function token(): string {
  return process.env.GITHUB_TOKEN || "";
}
function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${token()}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "ardeo-codex",
    "Content-Type": "application/json",
  };
}

/** Whether a GitHub token is configured (→ commit backend instead of local fs). */
export function githubEnabled(): boolean {
  return Boolean(token());
}

async function gh(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { ...headers(), ...(init?.headers || {}) },
    cache: "no-store",
  });
  return res;
}

/** Read a file from the repo. Returns null if it does not exist. */
export async function ghGetFile(
  filePath: string
): Promise<{ content: string; sha: string } | null> {
  const res = await gh(
    `${API}/repos/${repo()}/contents/${filePath}?ref=${branch()}`
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${filePath}: ${res.status}`);
  const j = await res.json();
  return {
    content: Buffer.from(j.content, "base64").toString("utf8"),
    sha: j.sha,
  };
}

export interface FileChange {
  path: string;
  /** File text, or null to delete the file. */
  content: string | null;
}

/**
 * Commit one or more file changes as a SINGLE commit via the Git Data API.
 * One commit → one Vercel rebuild → a consistent published snapshot.
 *
 * - Deletions whose target is already gone are dropped (the trees API errors on
 *   deleting a non-existent path), so a delete is idempotent.
 * - The ref update is retried on a concurrent-save race (non-fast-forward)
 *   instead of failing, so two saves converge rather than one 500-ing.
 */
export async function ghCommitFiles(
  changes: FileChange[],
  message: string
): Promise<string> {
  const r = repo();
  const b = branch();

  // Drop deletes for files that no longer exist (idempotent delete).
  const resolved: FileChange[] = [];
  for (const ch of changes) {
    if (ch.content === null && !(await ghGetFile(ch.path))) continue;
    resolved.push(ch);
  }

  // Blobs are content-addressed and independent of the parent commit, so create
  // them once up front; only the tree/commit/ref steps are retried on a race.
  const tree: Array<Record<string, unknown>> = [];
  for (const ch of resolved) {
    if (ch.content === null) {
      tree.push({ path: ch.path, mode: "100644", type: "blob", sha: null });
      continue;
    }
    const blobRes = await gh(`${API}/repos/${r}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({
        content: Buffer.from(ch.content, "utf8").toString("base64"),
        encoding: "base64",
      }),
    });
    if (!blobRes.ok) throw new Error(`GitHub blob: ${blobRes.status}`);
    tree.push({
      path: ch.path,
      mode: "100644",
      type: "blob",
      sha: (await blobRes.json()).sha,
    });
  }

  let lastConflict = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    // Latest commit on the branch + its tree.
    const refRes = await gh(`${API}/repos/${r}/git/ref/heads/${b}`);
    if (!refRes.ok) throw new Error(`GitHub ref: ${refRes.status}`);
    const latestCommit = (await refRes.json()).object.sha as string;

    const commitRes = await gh(`${API}/repos/${r}/git/commits/${latestCommit}`);
    if (!commitRes.ok) throw new Error(`GitHub commit: ${commitRes.status}`);
    const baseTree = (await commitRes.json()).tree.sha as string;

    const treeRes = await gh(`${API}/repos/${r}/git/trees`, {
      method: "POST",
      body: JSON.stringify({ base_tree: baseTree, tree }),
    });
    if (!treeRes.ok) throw new Error(`GitHub tree: ${treeRes.status}`);
    const newTree = (await treeRes.json()).sha as string;

    const newCommitRes = await gh(`${API}/repos/${r}/git/commits`, {
      method: "POST",
      body: JSON.stringify({ message, tree: newTree, parents: [latestCommit] }),
    });
    if (!newCommitRes.ok)
      throw new Error(`GitHub new commit: ${newCommitRes.status}`);
    const newCommit = (await newCommitRes.json()).sha as string;

    const updRes = await gh(`${API}/repos/${r}/git/refs/heads/${b}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: newCommit }),
    });
    if (updRes.ok) return newCommit;
    // 422/409 → the branch moved under us (another save). Rebuild and retry.
    if (updRes.status === 422 || updRes.status === 409) {
      lastConflict = String(updRes.status);
      continue;
    }
    throw new Error(`GitHub update ref: ${updRes.status}`);
  }
  throw new Error(
    `GitHub update ref failed after retries (conflict ${lastConflict}). Please try again.`
  );
}
