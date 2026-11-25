import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { analyticsHref, filtersFrom, readAnalytics, visitRanges, visitStages } from "@/lib/admin-visit-analytics";
import { VISIT_IDLE_MINUTES } from "@/lib/visit-analytics";
import { formatVisitTime, sourceNames, visitorName } from "./presentation";
import styles from "./analytics.module.css";

export default async function AnalyticsPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const filters = filtersFrom(await searchParams);
  const data = await readAnalytics(filters).catch(() => null);
  return <section className={styles.wrap}>
    <header className={styles.head}>
      <div><h1>Visit analytics</h1><p>{visitRanges[filters.range]} · Visits from shoppers who allowed analytics</p></div>
      <a className={styles.secondary} href={analyticsHref(filters)}>Refresh</a>
    </header>
    {data ? <>
      <dl className={styles.metrics}>
        {[
          ["Visits", data.total], ["Viewed a product", data.viewed], ["Added to bag", data.bag],
          ["Reached checkout", data.checkout], ["Submitted payment", data.submitted],
        ].map(([label, count]) => <div key={label}><dt>{label}</dt><dd>{count.toLocaleString("en-IN")}</dd></div>)}
      </dl>
      <div className={styles.insights}>
        <section className={styles.card}>
          <h2>Top entry pages</h2>
          {data.topEntries.length ? <ul className={styles.paths}>{data.topEntries.map(row =>
            <li key={row.entryPath}><code>{row.entryPath}</code><span>{row._count.entryPath}</span></li>
          )}</ul> : <p className={styles.muted}>No visits recorded for this period.</p>}
        </section>
        <section className={styles.card}>
          <h2>Last pages in inactive visits</h2>
          {data.topStops.length ? <ul className={styles.paths}>{data.topStops.map(row =>
            <li key={row.lastPath}><code>{row.lastPath}</code><span>{row._count.lastPath}</span></li>
          )}</ul> : <p className={styles.muted}>No inactive visits in this period.</p>}
          <p className={styles.note}>A visit becomes inactive after {VISIT_IDLE_MINUTES} minutes without a recorded action.</p>
        </section>
      </div>
    </> : <p className={styles.card} role="alert">Visit analytics couldn’t load. Refresh to try again.</p>}
    <section className={styles.card} aria-labelledby="visit-list-title">
      <h2 id="visit-list-title">Visit timelines</h2>
      <form action="/admin/analytics" className={styles.filters}>
        <label>Time range<select name="range" defaultValue={filters.range}>
          {Object.entries(visitRanges).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select></label>
        <label>Shopping action<select name="stage" defaultValue={filters.stage}>
          <option value="">Any action</option>
          {Object.entries(visitStages).map(([value, stage]) => <option value={value} key={value}>{stage.label}</option>)}
        </select></label>
        <label>Shopper or visit ID<input name="q" defaultValue={filters.q} maxLength={100} placeholder="Name, email or guest ID" /></label>
        <button className={styles.primary}>Apply</button>
      </form>
      {data && <>
        <p className={styles.note}>{data.count.toLocaleString("en-IN")} {data.count === 1 ? "visit" : "visits"} matching these filters. Times are in IST.</p>
        {data.visits.length ? <ul className={styles.visits}>
          {data.visits.map(visit => <li key={visit.id}>
            <Link href={analyticsHref({ ...filters, page: data.page }, visit.id)} className={styles.visit}>
              <div><strong>{visitorName(visit)}</strong><small>{sourceNames[visit.source] || "Unknown source"}</small></div>
              <div><small>Entry page</small><code>{visit.entryPath}</code></div>
              <div><small>Last page</small><code>{visit.lastPath}</code></div>
              <div><small>{visit.lastSeenAt < data.inactiveSince ? "Last active" : "Recent activity"}</small>
                <time dateTime={visit.lastSeenAt.toISOString()}>{formatVisitTime(visit.lastSeenAt)}</time>
              </div>
              <span aria-hidden="true">→</span>
            </Link>
          </li>)}
        </ul> : <p className={styles.empty}>No visit timelines match these filters. Visits appear after shoppers allow analytics.</p>}
        {data.pages > 1 && <nav className={styles.pager} aria-label="Visit pages">
          {data.page > 1 && <Link className={styles.secondary} href={analyticsHref({ ...filters, page: data.page - 1 })}>Previous</Link>}
          <span>Page {data.page} of {data.pages}</span>
          {data.page < data.pages && <Link className={styles.secondary} href={analyticsHref({ ...filters, page: data.page + 1 })}>Next</Link>}
        </nav>}
      </>}
    </section>
  </section>;
}
