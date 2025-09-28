import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Helper function to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'ADMIN'
}

// GET /api/admin/news - Fetch all news for admin
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          published: true,
          views: true,
          createdAt: true,
          updatedAt: true,
          img: true,
          tags: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      prisma.news.count()
    ])

    return NextResponse.json({
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}

// POST /api/admin/news - Create a new news article
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, slug, content, excerpt, img, published, metaTitle, metaDescription, tagIds } = body

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingNews = await prisma.news.findUnique({
      where: { slug }
    })

    if (existingNews) {
      return NextResponse.json(
        { error: 'A news article with this slug already exists' },
        { status: 400 }
      )
    }

    // Create the news article
    const news = await prisma.news.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        img: img || '/images/blog/blog-small-01.jpg',
        published: published || false,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        tags: tagIds ? {
          connect: tagIds.map((id: number) => ({ id }))
        } : undefined
      },
      include: {
        tags: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json(news, { status: 201 })
  } catch (error) {
    console.error('Error creating news:', error)
    return NextResponse.json(
      { error: 'Failed to create news' },
      { status: 500 }
    )
  }
}
