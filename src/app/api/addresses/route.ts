import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/addresses - Get all addresses for logged-in user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user ID from session or fetch from database
    let userId = session.user.id;
    
    if (!userId && session.user.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      userId = user.id;
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID not found' },
        { status: 401 }
      );
    }

    const addresses = await prisma.addresses.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' }, // Default address first
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

// POST /api/addresses - Create new address
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    // Get user ID from session or fetch from database
    let userId = session.user.id;
    
    if (!userId && session.user.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      userId = user.id;
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID not found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { street, city, state, zip, country, type, isDefault } = body;

    // Validate required fields
    if (!street || !city || !state || !zip || !country) {
      return NextResponse.json(
        { error: 'Missing required fields: street, city, state, zip, country' },
        { status: 400 }
      );
    }

    // Check for duplicate address
    const existingAddress = await prisma.addresses.findFirst({
      where: {
        userId,
        street,
        city,
        state,
        zip,
        country
      }
    });

    if (existingAddress) {
      return NextResponse.json(
        { 
          error: 'This address already exists in your saved addresses.',
          code: 'DUPLICATE_ADDRESS'
        },
        { status: 400 }
      );
    }

    // Check if user already has 5 addresses
    const addressCount = await prisma.addresses.count({
      where: { userId }
    });

    if (addressCount >= 5) {
      return NextResponse.json(
        { 
          error: 'You have reached the maximum limit of 5 saved addresses. Please delete an existing address before adding a new one.',
          code: 'ADDRESS_LIMIT_REACHED',
          currentCount: addressCount,
          maxLimit: 5
        },
        { status: 400 }
      );
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.addresses.updateMany({
        where: { 
          userId,
          isDefault: true
        },
        data: { isDefault: false }
      });
    }

    // Create new address
    const address = await prisma.addresses.create({
      data: {
        id: `addr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        street,
        city,
        state,
        zip,
        country: country || 'India',
        type: type || 'SHIPPING',
        isDefault: isDefault || false,
        userId,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      address 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
}
