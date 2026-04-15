import { headers } from 'next/headers';

/** Allowed production domains */
const ALLOWED_HOSTS = ['www.kosvana.com', 'kosvana.com', 'www.mushmush.in', 'mushmush.in'];

/**
 * Static fallback URL for non-request contexts (emails, background jobs).
 * Prefers NEXT_PUBLIC_APP_URL so we can remove NEXTAUTH_URL without breaking email links.
 */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
}

/**
 * Get the base URL from the current request headers (server-side only).
 * Falls back to NEXTAUTH_URL or localhost.
 */
export async function getBaseUrl(): Promise<string> {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || headersList.get('x-forwarded-host') || '';
    const proto = headersList.get('x-forwarded-proto') || 'https';

    if (host && ALLOWED_HOSTS.some(h => host.startsWith(h))) {
      return `${proto}://${host}`;
    }
  } catch {
    // headers() throws outside of request context (e.g., module-level code)
  }

  return getAppUrl();
}

/**
 * Get base URL from an explicit request object (for API routes).
 */
export function getBaseUrlFromRequest(request: Request): string {
  const url = new URL(request.url);
  const host = request.headers.get('host') || url.host;
  const proto = request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');

  if (ALLOWED_HOSTS.some(h => host.startsWith(h))) {
    return `${proto}://${host}`;
  }

  return getAppUrl();
}
