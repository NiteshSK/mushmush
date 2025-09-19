import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products - Fetch all products with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const slug = searchParams.get('slug')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const inStock = searchParams.get('inStock')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    
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
            discounts: {
              where: {
                isActive: true,
                OR: [
                  { endDate: null },
                  { endDate: { gte: new Date() } }
                ]
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
    } catch (error) {
      // Fallback: fetch products without discounts if table doesn't exist
      console.log('Discounts table not found, fetching products without discounts');
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

    // Calculate average rating, stock status, and dynamic pricing for each product
    const productsWithRatings = products.map(product => {
      // Calculate average rating
      const averageRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

      // Calculate discounted price ONLY if active discount records exist
      let discountedPrice = null;
      let discountPercentage = 0;
      
      if (product.discounts && product.discounts.length > 0) {
        const activeDiscount = product.discounts[0]; // Get the first active discount
        
        if (activeDiscount.type === 'PERCENTAGE') {
          discountedPrice = Math.ceil(product.price * (1 - activeDiscount.value / 100));
          discountPercentage = activeDiscount.value;
        } else if (activeDiscount.type === 'FIXED_AMOUNT') {
          discountedPrice = Math.ceil(Math.max(0, product.price - activeDiscount.value));
          discountPercentage = ((product.price - discountedPrice) / product.price) * 100;
        }
      }
      // Removed fallback to old discountedPrice field - only use active discount records

      return {
        ...product,
        averageRating,
        reviewCount: product.reviews.length,
        isOutOfStock: !product.inStock,
        discountedPrice,
        discountPercentage: Math.round(discountPercentage),
        hasDiscount: discountedPrice !== null
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
    const body = await request.json()
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
      additionalInfo,
      benefits,
      categories
    } = body

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const product = await prisma.product.create({
      data: {
        title,
        slug,
        description,
        price,
        measurementValue,
        measurementType,
        inStock,
        featured,
        imgs,
        specifications,
        howToConsume,
        additionalInfo,
        benefits
      }
    })

    // Connect categories if provided
    if (categories && categories.length > 0) {
      await Promise.all(
        categories.map((categoryId: number) =>
          prisma.productCategory.create({
            data: {
              productId: product.id,
              categoryId
            }
          })
        )
      )
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
