import { renderMarkdown } from "@/lib/markdown";

/** Renders normalized markdown as themed, readable prose. */
export default function Markdown({
  source,
  dropcap = false,
}: {
  source: string;
  dropcap?: boolean;
}) {
  const html = renderMarkdown(source);
  return (
    <div className={dropcap ? "has-dropcap" : undefined}>
      <div
        className="prose prose-grimoire prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
