import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Helper function to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'ADMIN'
}

// GET /api/admin/news/[id] - Fetch a single news article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params;
    const newsId = parseInt(id)

    if (isNaN(newsId)) {
      return NextResponse.json(
        { error: 'Invalid news ID' },
        { status: 400 }
      )
    }

    const news = await prisma.news.findUnique({
      where: { id: newsId },
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

    if (!news) {
      return NextResponse.json(
        { error: 'News article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/news/[id] - Update a news article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params;
    const newsId = parseInt(id)

    if (isNaN(newsId)) {
      return NextResponse.json(
        { error: 'Invalid news ID' },
        { status: 400 }
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

    // Check if news exists
    const existingNews = await prisma.news.findUnique({
      where: { id: newsId }
    })

    if (!existingNews) {
      return NextResponse.json(
        { error: 'News article not found' },
        { status: 404 }
      )
    }

    // Check if slug already exists for a different news article
    const slugConflict = await prisma.news.findFirst({
      where: {
        slug,
        id: { not: newsId }
      }
    })

    if (slugConflict) {
      return NextResponse.json(
        { error: 'A news article with this slug already exists' },
        { status: 400 }
      )
    }

    // Update the news article
    const updatedNews = await prisma.news.update({
      where: { id: newsId },
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        img: img || existingNews.img,
        published: published !== undefined ? published : existingNews.published,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        tags: tagIds ? {
          set: tagIds.map((id: number) => ({ id }))
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

    return NextResponse.json(updatedNews)
  } catch (error) {
    console.error('Error updating news:', error)
    return NextResponse.json(
      { error: 'Failed to update news' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/news/[id] - Delete a news article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params;
    const newsId = parseInt(id)

    if (isNaN(newsId)) {
      return NextResponse.json(
        { error: 'Invalid news ID' },
        { status: 400 }
      )
    }

    // Check if news exists
    const existingNews = await prisma.news.findUnique({
      where: { id: newsId }
    })

    if (!existingNews) {
      return NextResponse.json(
        { error: 'News article not found' },
        { status: 404 }
      )
    }

    // Delete the news article
    await prisma.news.delete({
      where: { id: newsId }
    })

    return NextResponse.json({ message: 'News article deleted successfully' })
  } catch (error) {
    console.error('Error deleting news:', error)
    return NextResponse.json(
      { error: 'Failed to delete news' },
      { status: 500 }
    )
  }
}
