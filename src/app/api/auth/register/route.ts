import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates, getConciergeEmails } from '@/lib/email';
import { validatePasswordPolicy } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { otpStore } from '@/lib/otp-store';

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 registrations per IP per hour
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = rateLimit(`register:${ip}`, { max: 5, windowSeconds: 3600 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { name, email, password, phone, otp } = await request.json();

    // Validate input
    if (!name || !email || !password || !otp) {
      return NextResponse.json(
        { error: 'Name, email, password, and OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP first — proves email ownership
    const otpResult = await otpStore.verify(email.toLowerCase(), otp);
    if (!otpResult.valid) {
      return NextResponse.json(
        { error: otpResult.error || 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Enforce password policy
    const passwordCheck = validatePasswordPolicy(password);
    if (!passwordCheck.valid) {
      return NextResponse.json({ error: passwordCheck.error }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user with verified email
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        emailVerified: new Date(), // Email verified via OTP
        ...(phone && { phone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    });

    // Send welcome email
    try {
      const welcomeEmail = emailTemplates.welcome(name);
      await sendEmail({
        to: email,
        subject: welcomeEmail.subject,
        html: welcomeEmail.html,
        text: welcomeEmail.text
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    // Send admin + concierge notification
    try {
      const recipients = getConciergeEmails();
      if (recipients.length > 0) {
        const adminNotification = emailTemplates.newUserSignup(name, email, user.createdAt);
        await sendEmail({
          to: recipients,
          subject: adminNotification.subject,
          html: adminNotification.html,
          text: adminNotification.text,
        });
      }
    } catch (adminEmailError) {
      console.error('Failed to send admin notification:', adminEmailError);
    }

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
