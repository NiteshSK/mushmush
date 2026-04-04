import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';
import crypto from 'crypto';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Rate limit: 3 requests per email per 15 minutes
    const rl = rateLimit(`forgot-password:${email.toLowerCase()}`, { max: 3, windowSeconds: 900 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${rl.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If an account with that email exists, we have sent a password reset link.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Send reset email
    try {
      const resetEmail = emailTemplates.resetPassword(user.name || 'User', resetToken);
      await sendEmail({
        to: email,
        subject: resetEmail.subject,
        html: resetEmail.html,
        text: resetEmail.text
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'If an account with that email exists, we have sent a password reset link.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
