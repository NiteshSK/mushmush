import { staffSession } from "@/lib/admin";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { listCatalogueProducts } from '@/lib/catalogue-server'

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

    const where: Prisma.ProductWhereInput = { archivedAt: null }
    
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

    // Same query, discount and stock rules as the server-rendered product pages.
    const { products: productsWithRatings, total } = await listCatalogueProducts({ where, skip, take: limit })

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
