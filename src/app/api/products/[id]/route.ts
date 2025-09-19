import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { triggerRestockNotifications } from '@/lib/notifications'

// GET /api/products/[id] - Fetch single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id)
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Calculate average rating
    const averageRating = product.reviews.length > 0 
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0

    return NextResponse.json({
      ...product,
      averageRating,
      reviewCount: product.reviews.length
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update product (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id)
    const body = await request.json()

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    const {
      title,
      description,
      price,
      discountedPrice,
      measurementValue,
      measurementType,
      inStock,
      featured,
      imgs,
      specifications,
      howToConsume,
      additionalInfo,
      benefits,
      categories
    } = body

    // Get current product state to check if stock status changed
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { inStock: true }
    });

    // Update slug if title changed
    const slug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(title && { title, slug }),
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(discountedPrice !== undefined && { discountedPrice }),
        ...(measurementValue && { measurementValue }),
        ...(measurementType && { measurementType }),
        ...(inStock !== undefined && { inStock }),
        ...(featured !== undefined && { featured }),
        ...(imgs && { imgs }),
        ...(specifications && { specifications }),
        ...(howToConsume && { howToConsume }),
        ...(additionalInfo && { additionalInfo }),
        ...(benefits && { benefits })
      }
    })

    // Trigger restock notifications whenever product is in stock.
    // Safe to call repeatedly; function only emails active subscribers and deactivates them after send.
    if (product.inStock) {
      console.log(`Product ${productId} is in stock, attempting to send restock notifications...`);
      try {
        await triggerRestockNotifications(productId);
      } catch (error) {
        console.error('Failed to send restock notifications:', error);
        // Don't fail the update if notifications fail
      }
    }

    // Update categories if provided
    if (categories) {
      // Remove existing categories
      await prisma.productCategory.deleteMany({
        where: { productId }
      })

      // Add new categories
      if (categories.length > 0) {
        await prisma.productCategory.createMany({
          data: categories.map((categoryId: number) => ({
            productId,
            categoryId
          })),
          skipDuplicates: true
        })
      }
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete product (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id)

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    await prisma.product.delete({
      where: { id: productId }
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
