import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: false,
});

/** Render normalized markdown (links already resolved by the sync step) to HTML. */
export function renderMarkdown(md: string): string {
  return marked.parse(md) as string;
}
