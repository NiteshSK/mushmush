import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, sendOTPEmail } from '@/lib/email';
import { otpStore, cleanupExpiredOTPs } from '@/lib/otp-store';
import { sendOTPViaSMS, isSMSConfigured } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    // Lazy cleanup of expired OTPs (at most once every 5 min)
    cleanupExpiredOTPs();

    const body = await request.json();
    const { email, customerName, phone } = body;

    if (!email || !customerName) {
      return NextResponse.json(
        { error: 'Email and customer name are required' },
        { status: 400 }
      );
    }

    // Check rate limiting
    const rateLimitCheck = await otpStore.checkRateLimit(email.toLowerCase());

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: rateLimitCheck.message,
          retryAfter: rateLimitCheck.retryAfter
        },
        { status: 429 }
      );
    }

    // Generate cryptographically secure OTP
    const otp = generateOTP();

    // Store OTP (hashed) with 5 minute expiration
    const expiresAt = Date.now() + 5 * 60 * 1000;
    await otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt,
      phone: phone || undefined,
    });

    // Send OTP via both channels in parallel
    const sendPromises: Promise<any>[] = [];

    // 1. Email (primary — always sent)
    sendPromises.push(sendOTPEmail(email, otp, customerName));

    // 2. SMS (secondary — sent if phone provided and MSG91 configured)
    let smsSent = false;
    if (phone && isSMSConfigured()) {
      sendPromises.push(
        sendOTPViaSMS(phone, otp).then(result => {
          smsSent = result.success;
          return result;
        })
      );
    }

    const results = await Promise.allSettled(sendPromises);

    // Check if at least email was sent successfully
    const emailResult = results[0];
    const emailSuccess = emailResult.status === 'fulfilled' && emailResult.value?.success;

    if (!emailSuccess) {
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }

    // Build response message
    let message = 'OTP sent to your email';
    if (smsSent) {
      message = 'OTP sent to your email and phone';
    } else if (phone && isSMSConfigured()) {
      message = 'OTP sent to your email (SMS delivery pending)';
    }

    return NextResponse.json({
      success: true,
      message,
      channels: {
        email: true,
        sms: smsSent,
      },
      expiresIn: 300,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
