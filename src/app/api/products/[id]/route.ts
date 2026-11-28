import { NextRequest, NextResponse } from 'next/server'
import { staffSession } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { availablePacks, isPackQuantity } from '@/lib/inventory'

// GET /api/products/[id] - Fetch single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = Number(id)
    
    if (!Number.isSafeInteger(productId) || productId < 1) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: productId, archivedAt: null },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        reviews: {
          select: { id: true, rating: true, comment: true, createdAt: true, user: { select: { name: true } } },
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
    const stockQuantity = product.inStock ? availablePacks(product.quantity, product.measurementValue, product.measurementType) : 0

    return NextResponse.json({
      ...product,
      stockQuantity,
      inStock: stockQuantity > 0,
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
    if (!(await staffSession("fulfillment"))) return NextResponse.json({ error: "Staff access required" }, { status: 403 })
    const { id } = await params
    const productId = Number(id)
    const body = await request.json()

    if (!Number.isSafeInteger(productId) || productId < 1) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    const {
      title,
      description,
      price,
      measurementValue,
      measurementType,
      featured,
      imgs,
      specifications,
      howToConsume,
      additionalInfo,
      benefits,
      categories
    } = body

    if (body.fulfillmentClass !== undefined && !["fresh", "national"].includes(body.fulfillmentClass)) {
      return NextResponse.json({ error: "Choose a delivery class" }, { status: 400 });
    }
    if (price !== undefined && (!Number.isFinite(price) || price <= 0) ||
        measurementValue !== undefined && !isPackQuantity(measurementValue) ||
        categories !== undefined && (!Array.isArray(categories) || !categories.every(Number.isInteger))) {
      return NextResponse.json({ error: "Check the price, pack size and categories." }, { status: 400 });
    }
    if (body.quantity !== undefined || body.inStock !== undefined) {
      return NextResponse.json({ error: "Adjust stock and availability in Inventory." }, { status: 400 });
    }
    if (measurementType !== undefined && (typeof measurementType !== "string" || !measurementType.trim())) {
      return NextResponse.json({ error: "Enter a pack unit." }, { status: 400 });
    }
    const expected = body.expectedUpdatedAt ? new Date(body.expectedUpdatedAt) : undefined;
    if (expected && !Number.isFinite(expected.getTime())) return NextResponse.json({ error: "Invalid product version" }, { status: 400 });
    const product = await prisma.$transaction(async tx => {
      const current = await tx.product.findUnique({ where: { id: productId }, select: { inStock: true, quantity: true, measurementType: true, measurementValue: true, updatedAt: true } });
      if (!current) return null;
      const packChanged = measurementType !== undefined && measurementType !== current.measurementType || measurementValue !== undefined && measurementValue !== current.measurementValue;
      const unavailable = packChanged && current.inStock && availablePacks(current.quantity, measurementValue ?? current.measurementValue, measurementType ?? current.measurementType) < 1;
      const changed = await tx.product.updateMany({
        where: { id: productId, archivedAt: null, updatedAt: expected ?? current.updatedAt },
        data: { title, description, price, measurementValue, measurementType, ...(unavailable ? { inStock: false } : {}), featured,
          fulfillmentClass: body.fulfillmentClass, imgs, specifications, howToConsume, additionalInfo, benefits }
      });
      if (!changed.count) return null;
      if (categories) {
        await tx.productCategory.deleteMany({where:{productId}});
        await tx.productCategory.createMany({data:categories.map((categoryId:number) => ({productId,categoryId})), skipDuplicates:true});
      }
      return tx.product.findUniqueOrThrow({where:{id:productId}});
    });
    if (!product) return NextResponse.json({ error: "This product changed or was archived. Reload before saving." }, {status:409});
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
    if (!(await staffSession("fulfillment"))) return NextResponse.json({ error: "Staff access required" }, { status: 403 })
    const { id } = await params
    const productId = Number(id)

    if (!Number.isSafeInteger(productId) || productId < 1) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    await prisma.product.update({
      where: { id: productId }, data: { archivedAt: new Date(), inStock: false, featured: false }
    })

    return NextResponse.json({ message: 'Product archived' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
