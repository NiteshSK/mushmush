import { staffSession } from "@/lib/admin";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { availablePacks, formatBulkQuantity } from '@/lib/inventory'
import { activeDiscountsInclude, computeProductDiscount } from '@/lib/product-pricing'

// GET /api/products - Fetch all products with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const slug = searchParams.get('slug')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const inStock = searchParams.get('inStock')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const skip = (page - 1) * limit

    const where: any = { archivedAt: null }
    
    // If ID is provided, fetch single product
    if (id) {
      where.id = parseInt(id)
    }
    
    // If slug is provided, fetch single product
    if (slug) {
      where.slug = slug
    }
    
    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category
          }
        }
      }
    }
    
    if (featured === 'true') {
      where.featured = true
    }
    
    if (inStock === 'true') {
      where.inStock = true
    }

    let products, total;
    
    try {
      // Try to fetch products with discounts
      [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            categories: {
              include: {
                category: true
              }
            },
            reviews: {
              select: {
                rating: true
              }
            },
            // Same active-discount rule as server-side order pricing
            discounts: activeDiscountsInclude()
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.product.count({ where })
      ]);
    } catch (error) {
      // Fallback: fetch products without discounts if table doesn't exist
      // Fallback: fetch products without discounts table
      [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            categories: {
              include: {
                category: true
              }
            },
            reviews: {
              select: {
                rating: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.product.count({ where })
      ]);
      
      // Add empty discounts array to each product
      products = products.map(product => ({
        ...product,
        discounts: []
      }));
    }

    // Products added within the last 14 days are automatically tagged "New"
    const newThreshold = new Date();
    newThreshold.setDate(newThreshold.getDate() - 14);

    // Calculate average rating, stock status, and dynamic pricing for each product
    const productsWithRatings = products.map(product => {
      // Calculate average rating
      const averageRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

      // Calculate discounted price ONLY if active discount records exist.
      // Shared with server-side order pricing (src/lib/product-pricing.ts).
      const { discountedPrice, discountPercentage } = computeProductDiscount(product.price, product.discounts);

      const packs = availablePacks(product.quantity, product.measurementValue, product.measurementType);

      return {
        ...product,
        averageRating,
        reviewCount: product.reviews.length,
        isOutOfStock: !product.inStock,
        stockQuantity: packs,
        bulkQuantity: product.quantity,
        bulkDisplay: formatBulkQuantity(product.quantity, product.measurementType),
        discountedPrice,
        discountPercentage: Math.round(discountPercentage),
        hasDiscount: discountedPrice !== null,
        isNew: product.createdAt >= newThreshold
      };
    })

    return NextResponse.json({
      products: productsWithRatings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create a new product (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await staffSession("fulfillment");
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json()
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

    if (typeof title !== "string" || !title.trim() || typeof description !== "string" || !description.trim()) {
      return NextResponse.json({ error: "Enter a product name and description." }, { status: 400 });
    }
    if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(measurementValue) ||
        measurementValue <= 0 || measurementValue > 2147483647 || typeof measurementType !== "string" || !measurementType.trim()) {
      return NextResponse.json({ error: "Enter a positive price and a whole-number pack size with a unit." }, { status: 400 });
    }
    if (categories !== undefined && (!Array.isArray(categories) || !categories.every(Number.isSafeInteger))) {
      return NextResponse.json({ error: "Check the selected shop categories." }, { status: 400 });
    }
    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    if (!slug) return NextResponse.json({ error: "Include a letter from A to Z or a number in the product name to create its shop link." }, { status: 400 });

    if (!["fresh", "national"].includes(body.fulfillmentClass)) return NextResponse.json({ error: "Choose a delivery class" }, { status: 400 })
    const product = await prisma.product.create({
      data: {
        fulfillmentClass: body.fulfillmentClass,
        title,
        slug,
        description,
        price,
        measurementValue,
        measurementType,
        inStock: false,
        featured,
        imgs,
        specifications,
        howToConsume,
        additionalInfo,
        benefits,
        categories: categories?.length ? { createMany: { data: categories.map((categoryId:number)=>({categoryId})), skipDuplicates:true } } : undefined
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ error: "That name is already used in a shop link. Choose a distinct name, such as one that includes the pack size." }, { status: 409 });
      }
      if (error.code === "P2003") {
        return NextResponse.json({ error: "A selected shop category is no longer available. Reload the form and choose again." }, { status: 409 });
      }
    }
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
