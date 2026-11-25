/**
 * @jest-environment node
 */
process.env.NEXTAUTH_SECRET = 'test-secret';
import { createOrderPaymentToken, createOrderTrackingToken, isValidOrderPaymentToken, isValidOrderTrackingToken, orderTrackingUrl } from '@/lib/order-access';

describe('order tracking tokens', () => {
  it('are bound to one order', () => {
    const token = createOrderTrackingToken('order-1');
    expect(isValidOrderTrackingToken('order-1', token)).toBe(true);
    expect(isValidOrderTrackingToken('order-2', token)).toBe(false);
  });

  it('cannot be used as payment tokens, and the other way round', () => {
    const tracking = createOrderTrackingToken('order-1');
    const payment = createOrderPaymentToken('order-1');
    expect(tracking).not.toBe(payment);
    expect(isValidOrderPaymentToken('order-1', tracking)).toBe(false);
    expect(isValidOrderTrackingToken('order-1', payment)).toBe(false);
  });

  it('rejects missing or malformed tokens', () => {
    expect(isValidOrderTrackingToken('order-1', undefined)).toBe(false);
    expect(isValidOrderTrackingToken('order-1', '')).toBe(false);
    expect(isValidOrderTrackingToken('order-1', 'zz'.repeat(32))).toBe(false);
    expect(isValidOrderTrackingToken('order-1', createOrderTrackingToken('order-1').slice(0, 63))).toBe(false);
  });

  it('builds a relative /track link', () => {
    const url = orderTrackingUrl({ id: 'order-1', orderNumber: 'ORD-1 2' });
    expect(url).toBe(`/track?order=ORD-1%202&token=${createOrderTrackingToken('order-1')}`);
  });
});
