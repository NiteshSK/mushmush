import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/addresses - Get all addresses for logged-in user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const addresses = await prisma.addresses.findMany({
      where: { userId: session.user.id },
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
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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

    // Check if user already has 5 addresses
    const addressCount = await prisma.addresses.count({
      where: { userId: session.user.id }
    });

    if (addressCount >= 5) {
      return NextResponse.json(
        { error: 'Maximum 5 addresses allowed. Please delete an existing address first.' },
        { status: 400 }
      );
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.addresses.updateMany({
        where: { 
          userId: session.user.id,
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
        type: type || 'BOTH',
        isDefault: isDefault || false,
        userId: session.user.id,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      address 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
}
