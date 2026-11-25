/**
 * Who may submit a payment for a retail order.
 *
 * Order numbers are sequential timestamps (`ORD-<ms>`), so knowing one proves
 * nothing. A payment submission is accepted only from:
 * - the browser that created the order through OTP-verified checkout, which
 *   received `paymentToken` in the checkout response; or
 * - the signed-in account that owns the order.
 *
 * The token is an HMAC of the order ID with NEXTAUTH_SECRET, so it needs no
 * database column and cannot be derived from the order number.
 */
import { createHmac, timingSafeEqual } from 'crypto';

/** Shared user row that owns every guest order (see verify-and-place-order). */
export const GUEST_USER_EMAIL = 'guest@mushmush.in';

function secret(): string {
  const key = process.env.NEXTAUTH_SECRET;
  if (!key) throw new Error('NEXTAUTH_SECRET is not set; order payment tokens cannot be issued or checked.');
  return key;
}

export function createOrderPaymentToken(orderId: string): string {
  return createHmac('sha256', secret()).update(`order-payment:${orderId}`).digest('hex');
}

export function isValidOrderPaymentToken(orderId: string, token: unknown): boolean {
  if (typeof token !== 'string' || !/^[0-9a-f]{64}$/.test(token)) return false;
  const expected = Buffer.from(createOrderPaymentToken(orderId), 'hex');
  return timingSafeEqual(expected, Buffer.from(token, 'hex'));
}

interface SessionUserLike {
  id?: string | null;
  email?: string | null;
}

/** True when a signed-in, non-guest account owns the order. */
export function ownsOrder(user: SessionUserLike | null | undefined, order: { userId: string | null }): boolean {
  if (!user?.id || !order.userId) return false;
  if (user.email?.toLowerCase() === GUEST_USER_EMAIL) return false;
  return user.id === order.userId;
}

/**
 * Read-only tracking link for an order (guests have no account to sign in to).
 * A different purpose prefix from the payment token, so neither token works as the other.
 */
export function createOrderTrackingToken(orderId: string): string {
  return createHmac('sha256', secret()).update(`order-track:${orderId}`).digest('hex');
}

export function isValidOrderTrackingToken(orderId: string, token: unknown): boolean {
  if (typeof token !== 'string' || !/^[0-9a-f]{64}$/.test(token)) return false;
  const expected = Buffer.from(createOrderTrackingToken(orderId), 'hex');
  return timingSafeEqual(expected, Buffer.from(token, 'hex'));
}

/** Relative /track link for an order. */
export function orderTrackingUrl(order: { id: string; orderNumber: string }): string {
  return `/track?order=${encodeURIComponent(order.orderNumber)}&token=${createOrderTrackingToken(order.id)}`;
}
