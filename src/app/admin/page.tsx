"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Box, Leaf, PackageOpen, RefreshCw } from "lucide-react";
import styles from "./today.module.css";

type Work = {
  finance: boolean; fulfillment: boolean; editor: boolean; trainer: boolean;
  payments: number | null; training: number | null; pack: number | null; fresh: number | null; stock: number | null;
  oldest: string | null; updatedAt: string;
};
const stamp = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", day: "numeric", month: "short" });
const queues = [
  { key: "pack", title: "Ready to pack", href: "/admin/orders?status=CONFIRMED", detail: "Confirmed orders", Icon: Box },
  { key: "fresh", title: "Dehradun deliveries", href: "/admin/orders?delivery=fresh", detail: "Open fresh orders", Icon: Leaf },
  { key: "stock", title: "Stock needing attention", href: "/admin/inventory?attention=1", detail: "Unavailable or 5 packs or fewer", Icon: PackageOpen },
] as const;

export default function Today() {
  const [work, setWork] = useState<Work | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch("/api/admin/today", { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("Unavailable");
        const result = await response.json();
        if (!controller.signal.aborted) setWork(result);
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [refresh]);
  const paymentTotal = work?.payments != null && work.training != null ? work.payments + work.training : null;
  return <section className={styles.desk} aria-labelledby="today-title" aria-busy={loading}>
    <header className={styles.heading}><div><h1 id="today-title">Today</h1>
      {work && !error && <p>Updated {stamp.format(new Date(work.updatedAt))} IST</p>}</div>
      <button disabled={loading} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={15} aria-hidden="true"/> {loading ? "Refreshing…" : "Refresh"}</button>
    </header>
    {error ? <p className={styles.problem} role="alert">Work queues could not be loaded. <button onClick={() => setRefresh(value => value + 1)}>Try again</button></p>
      : !work ? <p role="status">Loading work queues…</p> : <>
      {work.finance && <div className={styles.payments}>
        <div><h2>Payments to check</h2><strong aria-label={paymentTotal === null ? "Total unavailable" : undefined}>{paymentTotal ?? "—"}</strong>
          <p>{paymentTotal === null ? "Part of this queue is unavailable. Refresh to try again." :
            work.oldest ? "Oldest pending · " + stamp.format(new Date(work.oldest)) + " IST" : "All submitted payments have been reviewed."}</p></div>
        <div className={styles.links}>
          <Link href="/admin/orders?status=PAYMENT_RECEIVED">Store orders <b>{work.payments ?? "Unavailable"}</b><ArrowRight size={17}/></Link>
          <Link href="/admin/payment-verification">Training payments <b>{work.training ?? "Unavailable"}</b><ArrowRight size={17}/></Link>
        </div>
      </div>}
      {work.fulfillment && <div className={styles.queues}>{queues.map(({key,title,href,detail,Icon}) =>
        <Link key={key} className={styles.queue} href={href}>
          <div className={styles.queueTitle}><Icon size={19} aria-hidden="true"/><h2>{title}</h2></div>
          <strong>{work[key] ?? "—"}</strong><span>{work[key] == null ? "Count unavailable" : detail}<ArrowUpRight size={16} aria-hidden="true"/></span>
        </Link>)}</div>}
      {!work.finance && !work.fulfillment && <div className={styles.queues}>
        {work.editor && <Link className={styles.queue} href="/admin/blogs"><h2>Journal</h2><span>Manage articles <ArrowRight size={16}/></span></Link>}
        {work.editor && <Link className={styles.queue} href="/admin/news"><h2>News</h2><span>Manage news <ArrowRight size={16}/></span></Link>}
        {work.trainer && <Link className={styles.queue} href="/admin/training-registrations"><h2>Training registrations</h2><span>Open registration list <ArrowRight size={16}/></span></Link>}
      </div>}
    </>}
  </section>;
}
