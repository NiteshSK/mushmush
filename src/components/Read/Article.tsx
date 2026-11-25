import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";
import styles from "../Pantry/pantry.module.css";
import read from "../Pantry/read.module.css";
import { CountView } from "./Beacons";
import { formatDate, imageSrc, isExternal, isoDate, splitPublisher } from "./format";

type Back = { href: "/blogs" | "/news"; label: string };

type FrameProps = {
  back: Back;
  date: Date;
  publisher?: string | null;
  title: string;
  lede?: string | null;
  image?: string | null;
  /** Article HTML from the database. It is sanitised here, before it reaches the page. */
  html?: string | null;
  children?: ReactNode;
};

/** One reading column (about 70 characters a line) with a serif title, a real date and an optional wider photograph. */
function ArticleFrame({ back, date, publisher, title, lede, image, html, children }: FrameProps) {
  return <main id="main" className={read.article}>
    <article>
      <div className={read.column}>
        <Link href={back.href} className={read.back}><ArrowLeft aria-hidden="true" />{back.label}</Link>
        <header className={read.articleHead}>
          <p className={read.meta}>
            <time dateTime={isoDate(date)}>{formatDate(date)}</time>
            {publisher && <span>{publisher}</span>}
          </p>
          <h1>{title}</h1>
          {lede && <p className={read.lede}>{lede}</p>}
        </header>
      </div>
      {image && <div className={read.hero}><Image src={image} alt="" fill priority sizes="(max-width: 832px) 100vw, 832px" /></div>}
      <div className={read.column}>
        {html && <div className={read.prose} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />}
        {children}
      </div>
    </article>
  </main>;
}

/** Ends an article with one shop action. A product search appears only when the catalogue has results for it. */
function ArticleEnd({ topic, more }: { topic: string | null; more: { href: string; label: string } }) {
  return <footer className={read.articleEnd}>
    <div className={read.actions}>
      {topic
        ? <Link className={styles.primaryAction} href={`/search?search=${encodeURIComponent(topic)}`}>Search the pantry for {topic}</Link>
        : <Link className={styles.primaryAction} href="/shop">Shop the pantry</Link>}
      <Link className={styles.textAction} href={more.href}>{more.label}</Link>
    </div>
  </footer>;
}

type Post = { slug: string; title: string; excerpt: string | null; img: string | null; content: string; createdAt: Date };

export function JournalArticle({ post, topic }: { post: Post; topic: string | null }) {
  return <>
    <CountView kind="journal" slug={post.slug} />
    <ArticleFrame back={{ href: "/blogs", label: "Journal" }} date={post.createdAt} title={post.title} lede={post.excerpt}
      image={imageSrc(post.img)} html={post.content}>
      <ArticleEnd topic={topic} more={{ href: "/blogs", label: "More from the journal" }} />
    </ArticleFrame>
  </>;
}

type NewsItem = Post & { source: string; sourceUrl: string | null };

/**
 * Scraped news is a headline that belongs to another publisher. Its stored body is generated
 * filler, so the page credits the publisher and links to the original instead of showing it.
 * News written in the admin renders like a journal article.
 */
export function NewsArticle({ item, topic }: { item: NewsItem; topic: string | null }) {
  const scraped = item.source === "scraped";
  const { headline, publisher } = scraped ? splitPublisher(item.title) : { headline: item.title, publisher: null };
  const source = isExternal(item.sourceUrl) ? item.sourceUrl : null;
  const by = publisher ?? "another publication";

  return <>
    <CountView kind="news" slug={item.slug} />
    {scraped && source
      ? <ArticleFrame back={{ href: "/news", label: "News" }} date={item.createdAt} publisher={publisher} title={headline}
        lede={`This story was published by ${by}. Read the full article on their site.`}>
        <div className={read.actions}>
          <a className={`${styles.primaryAction} ${read.external}`} href={source} target="_blank" rel="noopener noreferrer">
            Read it at {by}<ArrowUpRight aria-hidden="true" /><span className={styles.srOnly}> (opens in a new tab)</span>
          </a>
          <Link className={styles.textAction} href="/news">More news</Link>
        </div>
      </ArticleFrame>
      : <ArticleFrame back={{ href: "/news", label: "News" }} date={item.createdAt} title={headline} lede={item.excerpt}
        image={imageSrc(item.img)} html={item.content}>
        <ArticleEnd topic={topic} more={{ href: "/news", label: "More news" }} />
      </ArticleFrame>}
  </>;
}

/** Shown when an article or news slug does not match a published item. */
export function ArticleMissing({ kind }: { kind: "journal" | "news" }) {
  const journal = kind === "journal";
  return <main id="main" className={read.article}>
    <div className={`${read.column} ${styles.recovery}`}>
      <p className={styles.kicker}>{journal ? "Journal" : "News"}</p>
      <h1 className={read.missingTitle}>{journal ? "We can’t find that article." : "We can’t find that story."}</h1>
      <p>It may have been moved or unpublished.</p>
      <div className={read.actions}>
        <Link className={styles.primaryAction} href={journal ? "/blogs" : "/news"}>{journal ? "See all articles" : "See all news"}</Link>
        <Link className={styles.textAction} href="/shop">Shop the pantry</Link>
      </div>
    </div>
  </main>;
}
