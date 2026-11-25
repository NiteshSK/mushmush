"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Kind = "blogs" | "news";
type Story = {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  views: number;
  updatedAt: string;
  source?: string;
};

export default function EditorialList({ kind }: { kind: Kind }) {
  const router = useRouter(),
    search = useSearchParams();
  const params = search.toString();
  const page = Math.max(1, Number(search.get("page")) || 1);
  const [items, setItems] = useState<Story[]>([]);
  const [pages, setPages] = useState(1),
    [total, setTotal] = useState(0);
  const [revision, reload] = useState(0),
    [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const isNews = kind === "news";
  const label = isNews ? "News" : "Journal";
  function filter(values: Record<string, string>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(values)) value ? next.set(key, value) : next.delete(key);
    router.push("/admin/" + kind + "?" + next.toString());
  }
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch("/api/admin/" + kind + "?" + params, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw Error("Could not load the publication list.");
        const data = await response.json();
        if (controller.signal.aborted) return;
        setItems(data[kind]);
        setTotal(data.pagination.total);
        setPages(data.pagination.totalPages);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [kind, params, revision]);

  async function act(story: Story, remove: boolean) {
    if (
      remove &&
      !window.confirm("Permanently delete “" + story.title + "”? Unpublish to keep it as a draft.")
    )
      return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        "/api/admin/" + kind + "/" + story.id,
        remove
          ? { method: "DELETE" }
          : {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ published: !story.published, expectedUpdatedAt: story.updatedAt }),
            },
      );
      if (!response.ok) throw Error((await response.json()).error || "Could not apply change.");
      if (remove && page > 1 && items.length === 1) filter({ page: String(page - 1) });
      else reload((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-5">
      <header className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">{label}</h1>
        <Link
          href={"/admin/" + kind + (isNews ? "/create" : "/new")}
          className="bg-forest text-white py-2 px-4 rounded"
        >
          Create story
        </Link>
      </header>
      <form
        className="flex flex-wrap gap-3"
        key={params}
        onSubmit={(e) => {
          e.preventDefault();
          filter({ q: String(new FormData(e.currentTarget).get("q") || ""), page: "1" });
        }}
      >
        <label>
          Find a story{" "}
          <input className="border rounded px-3 py-2" name="q" defaultValue={search.get("q") || ""} />
        </label>
        <button>Search</button>
        <label>
          Status{" "}
          <select
            value={search.get("status") || ""}
            onChange={(e) => filter({ status: e.target.value, page: "1" })}
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label>
          Sort by{" "}
          <select
            value={search.get("sort") || "createdAt"}
            onChange={(e) => filter({ sort: e.target.value, page: "1" })}
          >
            <option value="createdAt">Date</option>
            <option value="title">Title</option>
            <option value="views">Views</option>
          </select>
        </label>
        <label>
          Order{" "}
          <select
            value={search.get("direction") || "desc"}
            onChange={(e) => filter({ direction: e.target.value, page: "1" })}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
      </form>
      {error && (
        <p role="alert">
          {error} <button onClick={() => reload((n) => n + 1)}>Retry</button>
        </p>
      )}
      {loading ? (
        <p role="status">Loading stories…</p>
      ) : (
        !error && (
          <>
            <p>
              {total} {total === 1 ? "story" : "stories"}
            </p>
            <ul className="divide-y bg-white rounded">
              {items.map((story) => (
                <li key={story.id} className="p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">{story.title}</h2>
                    <p>
                      {story.published ? "Published" : "Draft"} · {story.views} views
                      {isNews && (story.source === "scraped" ? " · Imported" : " · Staff story")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      className="underline"
                      href={"/admin/" + kind + "/" + story.id + (isNews ? "/edit" : "")}
                    >
                      Edit
                    </Link>
                    {story.published && (
                      <Link className="underline" href={"/" + kind + "/" + story.slug}>
                        View
                      </Link>
                    )}
                    <button disabled={busy} onClick={() => act(story, false)}>
                      {story.published ? "Unpublish" : "Publish"}
                    </button>
                    <button disabled={busy} onClick={() => act(story, true)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {!items.length && <p>No stories match these filters.</p>}
            {pages > 1 && (
              <nav aria-label="Story pages" className="flex gap-4">
                <button disabled={page <= 1} onClick={() => filter({ page: String(page - 1) })}>
                  Previous
                </button>
                Page {page} of {pages}
                <button disabled={page >= pages} onClick={() => filter({ page: String(page + 1) })}>
                  Next
                </button>
              </nav>
            )}
          </>
        )
      )}
    </section>
  );
}
