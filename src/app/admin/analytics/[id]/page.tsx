import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { analyticsHref, filtersFrom, readVisit } from "@/lib/admin-visit-analytics";
import { VISIT_EVENT_LABELS, VISIT_IDLE_MINUTES, type VisitEventKind } from "@/lib/visit-analytics";
import { formatVisitTime, sourceNames, visitorName } from "../presentation";
import styles from "../analytics.module.css";

function eventDetail(kind: string, detail: string | null) {
  if (kind === "shop_filter") return detail || "Default catalogue";
  if (!detail) return "";
  switch (kind) {
    case "product_info": return detail === "care" ? "Use & storage" : "Overview";
    case "gallery": return "Photo " + detail;
    case "bag_add": return detail.replace(/-/g, " ");
    case "page": return detail;
    default: return "";
  }
}

export default async function VisitPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const [route, query] = await Promise.all([params, searchParams]);
  const back = analyticsHref(filtersFrom(query));
  const visit = await readVisit(route.id).catch(() => undefined);
  if (visit === null) notFound();
  if (!visit) return <section className={styles.wrap}>
    <Link href={back} className={styles.secondary}>Back to visits</Link>
    <p className={styles.card} role="alert">This visit couldn’t load. Refresh to try again.</p>
  </section>;
  const inactive = Date.now() - visit.lastSeenAt.getTime() > VISIT_IDLE_MINUTES * 60_000;
  return <section className={styles.wrap}>
    <Link href={back} className={styles.back}>← Back to visits</Link>
    <header className={styles.head}>
      <div><h1>{visitorName(visit)}</h1><p>{visit.user ? visit.user.email : "Guest visit"} · {sourceNames[visit.source] || "Unknown source"}</p></div>
      <span className={styles.status}>{inactive ? "Inactive visit" : "Recent activity"}</span>
    </header>
    <dl className={styles.summary}>
      <div><dt>Entry page</dt><dd><code>{visit.entryPath}</code></dd></div>
      <div><dt>Last recorded page</dt><dd><code>{visit.lastPath}</code></dd></div>
      <div><dt>First activity</dt><dd>{formatVisitTime(visit.startedAt)} IST</dd></div>
      <div><dt>Last activity</dt><dd>{formatVisitTime(visit.lastSeenAt)} IST</dd></div>
    </dl>
    <section className={styles.card} aria-labelledby="timeline-title">
      <h2 id="timeline-title">Journey timeline</h2>
      <p className={styles.note}>Pages and shopping actions appear in the order recorded by this browser. Last activity can include scrolling or other interaction between entries.</p>
      {visit.events.length ? <ol className={styles.timeline}>
        {visit.events.map(event => {
          const detail = eventDetail(event.kind, event.detail);
          return <li key={event.sequence}>
            <time dateTime={event.observedAt.toISOString()}>{formatVisitTime(event.observedAt)} IST</time>
            <div><strong>{VISIT_EVENT_LABELS[event.kind as VisitEventKind] || "Shopping activity"}</strong>
              <code>{event.path}</code>{detail && <small>{detail}</small>}</div>
          </li>;
        })}
      </ol> : <p className={styles.empty}>No page or action events were captured in this visit.</p>}
    </section>
  </section>;
}
