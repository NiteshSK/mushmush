import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Constant-time check of a hex HMAC-SHA256 signature over the raw request body.
 * An optional `sha256=` prefix on the header value is accepted.
 * Returns false when the secret or signature is missing or malformed.
 */
export function isValidWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string | undefined
): boolean {
  if (!signatureHeader || !secret) return false;

  const provided = signatureHeader.trim().replace(/^sha256=/i, '');
  if (!/^[0-9a-f]{64}$/i.test(provided)) return false;

  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest();
  const providedBuf = Buffer.from(provided, 'hex');
  if (providedBuf.length !== expected.length) return false;

  return timingSafeEqual(providedBuf, expected);
}
