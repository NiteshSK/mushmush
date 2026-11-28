/**
 * Structured data for search engines (schema.org JSON-LD). Server-rendered, so crawlers read it
 * without running JavaScript. "<" is escaped so text from the database cannot close the script tag.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
