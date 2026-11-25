/**
 * Return URLs for sign-in, sign-up and password recovery.
 *
 * A `callbackUrl` query parameter comes from the address bar, so anyone can
 * craft it. Accept only a path on this site; anything else falls back to the
 * homepage, so a sign-in link can never send a shopper to another site.
 */
export const DEFAULT_CALLBACK_URL = "/";

const PROBE_ORIGIN = "http://callback.invalid";
// Returning to a sign-in, sign-up or recovery form after signing in is a dead end.
const AUTH_FORMS = /^\/(?:auth\/)?(?:signin|signup|forgot-password|reset-password|error)(?:\/|$)/i;
// Browsers drop tabs and newlines inside URLs and read "\" as "/", so "/\evil.example" or
// "/\t/evil.example" would become the protocol-relative "//evil.example".
// Built from a string so compilers cannot turn the escapes into raw line separators.
const UNSAFE_CHARACTERS = new RegExp("[\\u0000-\\u001F\\u007F-\\u009F\\s\\\\]");

/**
 * Returns `raw` as a same-origin path that starts with a single "/", or "/" when it is anything else.
 *
 * Pass `origin` (window.location.origin) to also accept an absolute URL on this site, such as the
 * `callbackUrl` that NextAuth or the chat assistant adds. The result is always a relative path.
 */
export function safeCallbackUrl(raw: string | null | undefined, origin?: string): string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 2048) return DEFAULT_CALLBACK_URL;
  if (UNSAFE_CHARACTERS.test(raw)) return DEFAULT_CALLBACK_URL;

  let path = raw;
  if (raw.charAt(0) !== "/") {
    if (!origin) return DEFAULT_CALLBACK_URL;
    let absolute: URL;
    try {
      absolute = new URL(raw);
    } catch {
      return DEFAULT_CALLBACK_URL;
    }
    if (absolute.protocol !== "http:" && absolute.protocol !== "https:") return DEFAULT_CALLBACK_URL;
    if (absolute.origin !== origin) return DEFAULT_CALLBACK_URL;
    path = absolute.pathname + absolute.search + absolute.hash;
  }

  if (path.charAt(0) !== "/" || path.charAt(1) === "/") return DEFAULT_CALLBACK_URL;

  let resolved: URL;
  try {
    resolved = new URL(path, PROBE_ORIGIN);
  } catch {
    return DEFAULT_CALLBACK_URL;
  }
  if (resolved.origin !== PROBE_ORIGIN) return DEFAULT_CALLBACK_URL;
  if (AUTH_FORMS.test(resolved.pathname)) return DEFAULT_CALLBACK_URL;
  return resolved.pathname + resolved.search + resolved.hash;
}

/** Adds the return URL to a link between the sign-in, sign-up and recovery pages. */
export function withCallbackUrl(href: string, callbackUrl: string): string {
  if (!callbackUrl || callbackUrl === DEFAULT_CALLBACK_URL) return href;
  const separator = href.indexOf("?") === -1 ? "?" : "&";
  return `${href}${separator}callbackUrl=${encodeURIComponent(callbackUrl)}`;
}
