import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';
import { validatePasswordPolicy } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
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
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
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

    // Send admin notification
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        const adminNotification = emailTemplates.newUserSignup(name, email, user.createdAt);
        await sendEmail({
          to: adminEmail,
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
