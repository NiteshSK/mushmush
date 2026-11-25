"use client";

import { type ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { syncCartOwner } from "@/redux/features/cart-slice";
import { store } from "@/redux/store";
import { ACCOUNT_LINKS, type AccountPath, signInHref } from "./links";
import styles from "../Pantry/pantry.module.css";
import a from "../Pantry/account.module.css";

/**
 * Session for an account page. The server already redirects signed-out visitors;
 * this also catches a session that ends while the page is open.
 */
export function useAccountSession(path: AccountPath) {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") router.replace(signInHref(path));
  }, [status, path, router]);
  return { session, status };
}

type Props = {
  path: AccountPath;
  title: ReactNode;
  /** Short line or action shown beside the title. */
  aside?: ReactNode;
  children: ReactNode;
};

export default function AccountFrame({ path, title, aside, children }: Props) {
  const current = path === "/my-account" ? "/account" : path;
  return <main id="main" className={`${styles.page} ${a.account}`}>
    <div className={styles.pageHead}>
      <div>
        <p className={styles.kicker}>Your account</p>
        <h1>{title}</h1>
      </div>
      {aside && <div className={a.headAside}>{aside}</div>}
    </div>
    <nav aria-label="Account" className={a.nav}>
      {ACCOUNT_LINKS.map(link => <Link key={link.href} href={link.href} aria-current={link.href === current ? "page" : undefined}>{link.label}</Link>)}
      {/* The bag stays in place on sign-out; bag continuity follows the session elsewhere. */}
      <button className={a.signOut} onClick={() => { store.dispatch(syncCartOwner(null)); signOut({ callbackUrl: "/" }); }}>Sign out</button>
    </nav>
    <div className={a.body}>{children}</div>
  </main>;
}
