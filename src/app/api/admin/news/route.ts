import { editorialList } from "@/lib/editorial-admin";
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { staffSession } from "@/lib/admin";

// Helper function to check if user is admin
async function isAdmin() {
  const session = await staffSession("editor")
  return !!session?.user
}

// GET /api/admin/news - Fetch all news for admin
export async function GET(request:NextRequest) {
  return editorialList(request,"news");
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
