import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "../Pantry/pantry.module.css";
import read from "../Pantry/read.module.css";
import { NewsLink } from "./Beacons";
import { listNews, listPosts } from "./data";
import { formatDate, imageSrc, isExternal, isoDate, pageCount, splitPublisher } from "./format";

type Section = { base: "/blogs" | "/news"; name: string; plural: string };
const JOURNAL: Section = { base: "/blogs", name: "The journal", plural: "articles" };
const NEWS: Section = { base: "/news", name: "The news", plural: "headlines" };

const pageHref = (base: string, page: number) => page > 1 ? `${base}?page=${page}` : base;

/** /blogs: published journal posts, six to a page. */
export function JournalIndex({ page }: { page: number }) {
  return <main id="main" className={`${styles.page} ${read.index}`}>
    <div className={styles.pageHead}>
      <div>
        <p className={styles.kicker}>Grow and cook at home</p>
        <h1>The <em>journal.</em></h1>
      </div>
      <p className={read.intro}>Step-by-step guides to growing and cooking mushrooms.<br /><Link href="/news">Read mushroom news</Link></p>
    </div>
    <section aria-label="Articles" className={read.listing}>
      <Suspense key={page} fallback={<ListLoading kind="journal" />}><PostList page={page} /></Suspense>
    </section>
  </main>;
}

/** /news: published headlines, six to a page. Scraped headlines open on the publisher's site. */
export function NewsIndex({ page }: { page: number }) {
  return <main id="main" className={`${styles.page} ${read.index}`}>

    <div className={styles.pageHead}>
      <div>
        <p className={styles.kicker}>From other publications</p>
        <h1>Mushroom <em>news.</em></h1>
      </div>
      <p className={read.intro}>Recent headlines about mushrooms and fungi, credited to their publishers.<br /><Link href="/blogs">Read the journal</Link></p>
    </div>
    <section aria-label="Headlines" className={read.listing}>
      <Suspense key={page} fallback={<ListLoading kind="news" />}><NewsList page={page} /></Suspense>
    </section>
  </main>;
}

export async function PostList({ page }: { page: number }) {
  let result: Awaited<ReturnType<typeof listPosts>>;
  try {
    result = await listPosts(page);
  } catch (error) {
    console.error("Journal: failed to load posts", error);
    return <Failed section={JOURNAL} page={page} />;
  }
  const { posts, total } = result;
  if (!total) return <div className={styles.recovery}>
    <h2>No articles yet.</h2>
    <p>Guides to growing and cooking mushrooms will appear here.</p>
    <Link className={styles.primaryAction} href="/shop">Shop the pantry</Link>
  </div>;
  if (!posts.length) return <PastEnd section={JOURNAL} pages={pageCount(total)} page={page} />;

  return <>
    <ul className={read.posts}>
      {posts.map((post, index) => {
        const src = imageSrc(post.img);
        return <li key={post.id}>
          <Link href={`/blogs/${post.slug}`} className={read.postLink}>
            {src && <div className={read.postImage}><Image src={src} alt="" fill sizes="(max-width: 767px) 100vw, 50vw" priority={index < 2} /></div>}
            <p className={read.meta}><time dateTime={isoDate(post.createdAt)}>{formatDate(post.createdAt)}</time></p>
            <h2>{post.title}</h2>
            {post.excerpt && <p className={read.excerpt}>{post.excerpt}</p>}
          </Link>
        </li>;
      })}
    </ul>
    <Pages section={JOURNAL} page={page} pages={pageCount(total)} />
  </>;
}

const squash = (text: string) => text.replace(/\s+/g, " ").trim();

export async function NewsList({ page }: { page: number }) {
  let result: Awaited<ReturnType<typeof listNews>>;
  try {
    result = await listNews(page);
  } catch (error) {
    console.error("News: failed to load headlines", error);
    return <Failed section={NEWS} page={page} />;
  }
  const { news, total } = result;
  if (!total) return <div className={styles.recovery}>
    <h2>No news right now.</h2>
    <p>Recent mushroom headlines will appear here. The journal has guides to read in the meantime.</p>
    <Link className={styles.primaryAction} href="/blogs">Read the journal</Link>
  </div>;
  if (!news.length) return <PastEnd section={NEWS} pages={pageCount(total)} page={page} />;

  return <>
    <ul className={read.newsList}>
      {news.map(item => {
        const scraped = item.source === "scraped";
        const { headline, publisher } = scraped ? splitPublisher(item.title) : { headline: item.title, publisher: null };
        // Scraped excerpts only repeat the headline and publisher, so show an excerpt only when it adds something.
        const excerpt = item.excerpt && !squash(item.excerpt).startsWith(squash(headline)) ? item.excerpt : null;
        const external = isExternal(item.sourceUrl) ? item.sourceUrl : null;
        const body = <>
          <p className={read.meta}>
            <time dateTime={isoDate(item.createdAt)}>{formatDate(item.createdAt)}</time>
            {publisher && <span>{publisher}</span>}
          </p>
          <h2>{headline}{external && <ArrowUpRight aria-hidden="true" />}</h2>
          {excerpt && <p className={read.excerpt}>{excerpt}</p>}
        </>;
        return <li key={item.id}>
          {external
            ? <NewsLink slug={item.slug} href={external} publisher={publisher} className={read.newsLink}>{body}</NewsLink>
            : <Link href={`/news/${item.slug}`} className={read.newsLink}>{body}</Link>}
        </li>;
      })}
    </ul>
    <Pages section={NEWS} page={page} pages={pageCount(total)} />
  </>;
}

/** Suspense fallback while a page of articles or headlines loads. */
export function ListLoading({ kind }: { kind: "journal" | "news" }) {
  return <div aria-busy="true">
    <p role="status" className={styles.srOnly}>{kind === "journal" ? "Loading articles…" : "Loading headlines…"}</p>
    {kind === "journal"
      ? <ul className={read.posts} aria-hidden="true">
        {[0, 1].map(i => <li key={i}><div className={read.skeletonImage} /><div className={read.skeletonLine} /><div className={read.skeletonLine} /></li>)}
      </ul>
      : <ul className={read.newsList} aria-hidden="true">
        {[0, 1, 2, 3].map(i => <li key={i} className={read.newsLink}><div className={read.skeletonLine} /><div className={read.skeletonLine} /></li>)}
      </ul>}
  </div>;
}

function Failed({ section, page }: { section: Section; page: number }) {
  return <div className={styles.recovery} role="alert">
    <h2>{section.name} couldn’t load.</h2>
    <p>Check your connection and try again.</p>
    {/* A full reload, so the server asks the database again. */}
    <a className={styles.primaryAction} href={pageHref(section.base, page)}>Try again</a>
  </div>;
}

function PastEnd({ section, pages, page }: { section: Section; pages: number; page: number }) {
  return <div className={styles.recovery}>
    <h2>There is no page {page}.</h2>
    <p>{section.name} has {pages} {pages === 1 ? "page" : "pages"} of {section.plural}.</p>
    <Link className={styles.primaryAction} href={section.base}>Go to the first page</Link>
  </div>;
}

function Pages({ section, page, pages }: { section: Section; page: number; pages: number }) {
  if (pages < 2) return null;
  return <nav className={styles.pagination} aria-label={`${section.name} pages`}>
    {page > 1 ? <Link href={pageHref(section.base, page - 1)}>Previous</Link> : <span aria-hidden="true" />}
    <ol>
      {Array.from({ length: pages }, (_, i) => i + 1).map(n => <li key={n}>
        <Link href={pageHref(section.base, n)} aria-current={n === page ? "page" : undefined} aria-label={`Page ${n}`}>{n}</Link>
      </li>)}
    </ol>
    {page < pages ? <Link href={pageHref(section.base, page + 1)}>Next</Link> : <span aria-hidden="true" />}
  </nav>;
}
