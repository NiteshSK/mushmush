"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { safeCallbackUrl } from "@/lib/safe-callback";

/**
 * Reads `?callbackUrl=` as a safe same-origin path.
 *
 * `callbackUrl` is safe to render (links keep it). It accepts an absolute URL on this site only after
 * mount, because the server does not know the origin. `resolve()` reads the live origin, so effects
 * and handlers get the full answer even before that re-render.
 */
export function useCallbackUrl() {
  const raw = useSearchParams()?.get("callbackUrl") ?? null;
  const [origin, setOrigin] = useState<string | undefined>(undefined);
  useEffect(() => setOrigin(window.location.origin), []);
  return useMemo(() => ({
    callbackUrl: safeCallbackUrl(raw, origin),
    resolve: () => safeCallbackUrl(raw, window.location.origin),
  }), [raw, origin]);
}

/** A full page load, so the header, bag and server components all read the new session cookie. */
export function hardNavigate(url: string) {
  window.location.assign(url);
}
