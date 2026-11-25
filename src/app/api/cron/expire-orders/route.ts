import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { expireUnpaidOrders } from '@/lib/order-expiry';

export const dynamic = 'force-dynamic';

function authorised(request: NextRequest, secret: string) {
  const given = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Scheduler entry point: cancels unpaid orders older than 48 hours. */
async function handle(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 503 });
  if (!authorised(request, secret)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { cancelled } = await expireUnpaidOrders();
    return NextResponse.json({ cancelled: cancelled.length, orderNumbers: cancelled });
  } catch (error) {
    console.error('Order expiry failed:', error);
    return NextResponse.json({ error: 'Order expiry failed' }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
