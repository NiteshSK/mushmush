import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PUT /api/addresses/[id] - Update address
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const { street, city, state, zip, country, type, isDefault } = body;

    // Check if address belongs to user
    const existingAddress = await prisma.addresses.findUnique({
      where: { id }
    });

    if (!existingAddress || existingAddress.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Address not found or unauthorized' },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.addresses.updateMany({
        where: { 
          userId: session.user.id,
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    // Update address
    const address = await prisma.addresses.update({
      where: { id },
      data: {
        ...(street && { street }),
        ...(city && { city }),
        ...(state && { state }),
        ...(zip && { zip }),
        ...(country && { country }),
        ...(type && { type }),
        ...(isDefault !== undefined && { isDefault }),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      address 
    });

  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

// DELETE /api/addresses/[id] - Delete address
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id } = params;

    // Check if address belongs to user
    const existingAddress = await prisma.addresses.findUnique({
      where: { id }
    });

    if (!existingAddress || existingAddress.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Address not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete address
    await prisma.addresses.delete({
      where: { id }
    });

    // If deleted address was default, set another as default
    if (existingAddress.isDefault) {
      const firstAddress = await prisma.addresses.findFirst({
        where: { userId: session.user.id }
      });

      if (firstAddress) {
        await prisma.addresses.update({
          where: { id: firstAddress.id },
          data: { isDefault: true }
        });
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}
