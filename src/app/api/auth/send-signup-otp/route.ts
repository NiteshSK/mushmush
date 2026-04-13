import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOTP, sendOTPEmail } from '@/lib/email';
import { otpStore } from '@/lib/otp-store';
import { sendOTPViaSMS, isSMSConfigured } from '@/lib/sms';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { email, name, phone } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Rate limit: 3 OTP requests per email per 5 minutes
    const rl = rateLimit(`signup-otp:${email.toLowerCase()}`, { max: 3, windowSeconds: 300 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${rl.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    // Generate OTP and store (hashed)
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    await otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt,
      phone: phone || undefined,
    });

    // Send OTP via email + SMS in parallel
    const sendPromises: Promise<any>[] = [
      sendOTPEmail(email, otp, name, 'signup'),
    ];

    if (phone && isSMSConfigured()) {
      sendPromises.push(sendOTPViaSMS(phone, otp));
    }

    const results = await Promise.allSettled(sendPromises);
    const emailResult = results[0];
    const emailSuccess = emailResult.status === 'fulfilled' && emailResult.value?.success;

    if (!emailSuccess) {
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      expiresIn: 300,
    });
  } catch (error) {
    console.error('Signup OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
