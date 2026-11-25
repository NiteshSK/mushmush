"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  analyticsConsent, MAX_VISIT_EVENTS, setAnalyticsConsent, VISIT_ACTIVITY_EVENT, VISIT_CONSENT,
  VISIT_IDLE_MINUTES, VISIT_PREFERENCE_EVENT, visitPath, visitShopContext, visitSource,
  type VisitAction, type VisitEventKind, type VisitSource,
} from "@/lib/visit-analytics";
import styles from "./visit.module.css";

const tabKey = "kosvana:storefront-visit";
const quietPeriod = VISIT_IDLE_MINUTES * 60_000;
const heartbeatInterval = 60_000;
type TabVisit = { id: string; sequence: number; activity: number; source: VisitSource; actor: string | null };

function getTab(): TabVisit | null {
  try { return JSON.parse(sessionStorage.getItem(tabKey) ?? "null"); }
  catch { return null; }
}

function clearTab() {
  try { sessionStorage.removeItem(tabKey); } catch { /* Analytics remains optional. */ }
}

function useAnalyticsPreference() {
  const [preference, setPreference] = useState<ReturnType<typeof analyticsConsent> | "loading">("loading");
  useEffect(() => {
    const sync = () => setPreference(analyticsConsent());
    sync();
    const storage = (event: StorageEvent) => { if (!event.key || event.key === VISIT_CONSENT) sync(); };
    window.addEventListener(VISIT_PREFERENCE_EVENT, sync);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener(VISIT_PREFERENCE_EVENT, sync);
      window.removeEventListener("storage", storage);
    };
  }, []);
  return preference;
}

export function VisitAnalyticsPreference() {
  const preference = useAnalyticsPreference();
  if (preference === "loading") return null;
  if (preference === "blocked") return <p>Your browser is blocking visit analytics.</p>;
  return <div className={styles.preference}>
    <p>Visit analytics is {preference === "allow" ? "on" : "off"} on this browser.</p>
    <button type="button" onClick={() => setAnalyticsConsent(preference !== "allow")}>
      {preference === "allow" ? "Turn off visit analytics" : "Allow visit analytics"}
    </button>
  </div>;
}

export default function VisitTracker() {
  const pathname = usePathname();
  const { data, status } = useSession();
  const role = data?.user?.role;
  const actor = data?.user?.id ?? null;
  const path = visitPath(pathname ?? "");
  const preference = useAnalyticsPreference();
  const lastPage = useRef<{ path: string; actor: string | null } | null>(null);
  const latestInput = useRef(0);
  const lastSent = useRef(0);
  const active = preference === "allow" && status !== "loading" && role !== "ADMIN" && role !== "STAFF";

  useEffect(() => {
    if (preference === "decline" || preference === "blocked" || role === "ADMIN" || role === "STAFF") clearTab();
    if (!active || !path) lastPage.current = null;
  }, [active, preference, role, path]);

  useEffect(() => {
    if (!active || !path) return;
    const emit = (kind: VisitEventKind, detail?: string) => {
      if (analyticsConsent() !== "allow" || visitPath(location.pathname) !== path || !globalThis.crypto?.randomUUID) return;
      const at = Date.now();
      const previous = getTab();
      const current = previous && previous.id && previous.sequence < MAX_VISIT_EVENTS &&
        previous.activity + quietPeriod > at && (!previous.actor || previous.actor === actor)
        ? previous
        : { id: crypto.randomUUID(), sequence: 0, activity: at, source: visitSource(document.referrer, location.origin), actor };
      current.actor = actor;
      current.sequence += 1;
      current.activity = at;
      try { sessionStorage.setItem(tabKey, JSON.stringify(current)); } catch { return; }
      lastSent.current = at;
      void fetch("/api/storefront/visit", {
        method: "POST", keepalive: true, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: current.id, sequence: current.sequence, source: current.source, kind, path, detail, at }),
      }).then(response => {
        // A stale or shared tab was rejected. The next action starts a fresh visit.
        if (response.status === 409 && getTab()?.id === current.id) {
          clearTab();
          lastPage.current = null;
        }
      }).catch(() => { /* Tracking never blocks a shopping action. */ });
    };

    if (lastPage.current?.path !== path || lastPage.current?.actor !== actor) {
      lastPage.current = { path, actor };
      emit("page", path === "/shop" ? visitShopContext(location.search) : undefined);
    }
    const onAction = (event: Event) => {
      const payload = (event as CustomEvent<{ kind: VisitAction; detail?: string }>).detail;
      if (payload) emit(payload.kind, payload.detail);
    };
    const interacted = () => { latestInput.current = Date.now(); };
    const presence = () => {
      if (latestInput.current > lastSent.current) emit("presence");
    };
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") presence(); }, heartbeatInterval);
    window.addEventListener(VISIT_ACTIVITY_EVENT, onAction);
    window.addEventListener("pointerdown", interacted, { passive: true });
    window.addEventListener("scroll", interacted, { passive: true });
    window.addEventListener("keydown", interacted);
    window.addEventListener("pagehide", presence);
    document.addEventListener("visibilitychange", presence);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(VISIT_ACTIVITY_EVENT, onAction);
      window.removeEventListener("pointerdown", interacted);
      window.removeEventListener("scroll", interacted);
      window.removeEventListener("keydown", interacted);
      window.removeEventListener("pagehide", presence);
      document.removeEventListener("visibilitychange", presence);
    };
  }, [active, actor, path]);

  if (preference !== "unset" || status === "loading" || !path || role === "ADMIN" || role === "STAFF" ||
      ["/checkout", "/cart", "/privacy"].includes(path) || path.startsWith("/auth/")) return null;

  return <aside className={styles.prompt} aria-label="Optional visit analytics">
    <p><strong>Allow visit analytics?</strong></p>
    <p>We use pages and shopping actions to improve the shop. If you sign in, they can be linked to your account.</p>
    <div className={styles.choices}>
      <button type="button" onClick={() => setAnalyticsConsent(true)}>Allow analytics</button>
      <button type="button" onClick={() => setAnalyticsConsent(false)}>No thanks</button>
      <Link href="/privacy#cookies">Privacy</Link>
    </div>
  </aside>;
}
