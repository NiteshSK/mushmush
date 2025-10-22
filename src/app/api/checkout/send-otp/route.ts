import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, sendOTPEmail } from '@/lib/email';
import { otpStore } from '@/lib/otp-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, customerName } = body;

    console.log('📧 OTP Request received for:', email);

    if (!email || !customerName) {
      console.error('❌ Missing email or customerName');
      return NextResponse.json(
        { error: 'Email and customer name are required' },
        { status: 400 }
      );
    }

    // Check rate limiting
    const rateLimitCheck = await otpStore.checkRateLimit(email.toLowerCase());
    
    if (!rateLimitCheck.allowed) {
      console.log('⏱️ Rate limit exceeded for:', email);
      return NextResponse.json(
        { 
          error: rateLimitCheck.message,
          retryAfter: rateLimitCheck.retryAfter
        },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    console.log('🔐 Generated OTP:', otp, 'for', email);
    
    // Store OTP with 5 minute expiration
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    await otpStore.set(email.toLowerCase(), { otp, expiresAt });
    console.log('💾 OTP stored in database');

    // Send OTP email
    console.log('📨 Attempting to send OTP email...');
    const result = await sendOTPEmail(email, otp, customerName);

    if (result.success) {
      console.log('✅ OTP email sent successfully!');
      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully to your email',
        expiresIn: 300, // 5 minutes in seconds
        debug: {
          email,
          otpGenerated: true,
          emailSent: true
        }
      });
    } else {
      console.error('❌ Failed to send OTP email:', result.error);
      return NextResponse.json(
        { error: 'Failed to send OTP email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error in send-otp API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
