"use client";

import { type ReactNode, useEffect } from "react";
import styles from "../Pantry/pantry.module.css";

const VIEWED_NEWS = "viewedNewsArticles";

/** Counts a news view at most once per browser session, as the news pages always have. */
function countNewsView(slug: string) {
  try {
    const viewed: string[] = JSON.parse(sessionStorage.getItem(VIEWED_NEWS) ?? "[]");
    if (viewed.includes(slug)) return;
    sessionStorage.setItem(VIEWED_NEWS, JSON.stringify([...viewed, slug]));
  } catch {
    // Storage can be blocked (private windows); count the view anyway.
  }
  fetch(`/api/news/${encodeURIComponent(slug)}/increment-view`, { method: "POST", keepalive: true }).catch(() => {});
}

/** Records one view of an article after it renders. Renders nothing. */
export function CountView({ kind, slug }: { kind: "journal" | "news"; slug: string }) {
  useEffect(() => {
    // React's development double mount clears the first timer, so a visit counts once.
    const timer = setTimeout(() => kind === "news"
      ? countNewsView(slug)
      : fetch(`/api/blog/${encodeURIComponent(slug)}/views`, { method: "POST", keepalive: true }).catch(() => {}), 100);
    return () => clearTimeout(timer);
  }, [kind, slug]);
  return null;
}

type NewsLinkProps = { slug: string; href: string; publisher: string | null; className?: string; children: ReactNode };

/** A headline that opens the publisher's article in a new tab and counts the view. */
export function NewsLink({ slug, href, publisher, className, children }: NewsLinkProps) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={() => countNewsView(slug)}>
    {children}<span className={styles.srOnly}> (opens {publisher ?? "the publisher’s site"} in a new tab)</span>
  </a>;
}
