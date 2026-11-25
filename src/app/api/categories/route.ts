import { NextRequest, NextResponse } from 'next/server'
import { staffSession } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

// GET /api/categories - Fetch all categories
export async function GET(request?:NextRequest) {
  try {
    if (request && new URL(request.url).searchParams.get("options") === "1") {
      return NextResponse.json(await prisma.category.findMany({select:{id:true,title:true,slug:true},orderBy:{title:"asc"}}));
    }
    const categories = await prisma.category.findMany({
      include: {
        products: {
          where: {product: {archivedAt: null}},
          include: {
            product: {
              select: {
                id: true,
                title: true,
                inStock: true
              }
            }
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    })

    // Add product count to each category
    const categoriesWithCount = categories.map(category => ({
      ...category,
      productCount: category.products.length,
      inStockCount: category.products.filter(p => p.product.inStock).length
    }))

    return NextResponse.json(categoriesWithCount)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create new category (Admin only)
export async function POST(request: NextRequest) {
  try {
    if (!(await staffSession("fulfillment"))) return NextResponse.json({ error: "Staff access required" }, { status: 403 })
    const body = await request.json()
    const { title, description, img, path } = body

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const category = await prisma.category.create({
      data: {
        title,
        slug,
        img,
        path,
        description
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
