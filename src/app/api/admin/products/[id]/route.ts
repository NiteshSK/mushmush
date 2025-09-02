import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// PUT /api/admin/products/[id] - Update product details (Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      price,
      measurementValue,
      measurementType,
      inStock,
      featured,
      imgs,
      specifications,
      howToConsume,
      additionalInfo
    } = body;

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: {
        id: parseInt(id)
      },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(measurementValue !== undefined && { measurementValue: parseInt(measurementValue) }),
        ...(measurementType && { measurementType }),
        ...(inStock !== undefined && { inStock: Boolean(inStock) }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
        ...(imgs && { imgs }),
        ...(specifications && { specifications }),
        ...(howToConsume && { howToConsume }),
        ...(additionalInfo && { additionalInfo })
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        discounts: {
          where: {
            isActive: true
          }
        }
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/products/[id] - Update specific product fields (Admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { field, value } = body;

    // Validate allowed fields
    const allowedFields = ['price', 'inStock', 'featured', 'title', 'description', 'measurementValue', 'measurementType'];
    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { error: `Field '${field}' is not allowed for updates` },
        { status: 400 }
      );
    }

    // Prepare update data based on field type
    let updateData: any = {};
    
    switch (field) {
      case 'price':
        updateData.price = parseFloat(value);
        break;
      case 'inStock':
      case 'featured':
        updateData[field] = Boolean(value);
        break;
      case 'measurementValue':
        updateData.measurementValue = parseInt(value);
        break;
      default:
        updateData[field] = value;
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id: parseInt(id)
      },
      data: updateData,
      include: {
        categories: {
          include: {
            category: true
          }
        },
        discounts: {
          where: {
            isActive: true
          }
        }
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product field:', error);
    return NextResponse.json(
      { error: 'Failed to update product field' },
      { status: 500 }
    );
  }
}
