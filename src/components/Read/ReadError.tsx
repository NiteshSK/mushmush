"use client";

import { startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../Pantry/pantry.module.css";
import read from "../Pantry/read.module.css";

/** Error boundary content for /blogs and /news pages, shown inside the pantry shell when the database cannot be read. */
export default function ReadError({ kind, reset }: { kind: "journal" | "news"; reset: () => void }) {
  const router = useRouter();
  // Server components need a refresh as well as a reset to load again.
  const retry = () => startTransition(() => { router.refresh(); reset(); });
  return <main id="main" className={read.article}>
    <div className={`${read.column} ${styles.recovery}`} role="alert">
      <p className={styles.kicker}>{kind === "journal" ? "Journal" : "News"}</p>
      <h1 className={read.missingTitle}>This page couldn’t load.</h1>
      <p>Check your connection and try again.</p>
      <div className={read.actions}>
        <button type="button" className={styles.primaryAction} onClick={retry}>Try again</button>
        <Link className={styles.textAction} href="/shop">Shop the pantry</Link>
      </div>
    </div>
  </main>;
}
