import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/coupon';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal, email } = await request.json();

    if (!code || subtotal === undefined || !email) {
      return NextResponse.json(
        { valid: false, message: 'Missing required fields: code, subtotal, email' },
        { status: 400 }
      );
    }

    // Rate limit: 10 attempts per email per 5 minutes (prevents brute forcing codes)
    const rl = rateLimit(`coupon:${email.toLowerCase()}`, { max: 10, windowSeconds: 300 });
    if (!rl.allowed) {
      return NextResponse.json(
        { valid: false, message: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const result = await validateCoupon(code, subtotal, email);

    return NextResponse.json(result, {
      status: result.valid ? 200 : 400,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { valid: false, message: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
