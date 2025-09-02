import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST - Create first admin user (only if no admin exists)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, setupToken } = body;

    // Check setup token (optional security measure)
    const expectedToken = process.env.ADMIN_SETUP_TOKEN;
    if (expectedToken && setupToken !== expectedToken) {
      return NextResponse.json(
        { error: 'Invalid setup token' },
        { status: 403 }
      );
    }

    // Check if any admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin user already exists. Use the admin panel to create additional users.' },
        { status: 409 }
      );
    }

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create first admin user
    const adminUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: adminUser,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}

// GET - Check if admin setup is needed
export async function GET() {
  try {
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    return NextResponse.json({
      setupRequired: !adminExists,
      hasAdmin: !!adminExists,
    });
  } catch (error) {
    console.error('Error checking admin setup:', error);
    return NextResponse.json(
      { error: 'Failed to check admin setup status' },
      { status: 500 }
    );
  }
}
