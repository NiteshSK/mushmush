import { sanitizeHtml } from "@/lib/sanitize";

export default function ArticlePreview({
  title,
  excerpt,
  content,
}: {
  title: string;
  excerpt: string;
  content: string;
}) {
  return (
    <details className="bg-white border rounded-lg p-4">
      <summary className="cursor-pointer font-medium">Preview story</summary>
      <article className="py-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p>{excerpt}</p>
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
      </article>
    </details>
  );
}
