import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Helper function to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'ADMIN'
}

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/admin/blogs/[id] - Get single blog post for editing
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const params = await context.params
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid blog post ID' },
        { status: 400 }
      )
    }

    const blogPost = await prisma.blogPost.findUnique({
      where: { id },
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
    })

    if (!blogPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      blog: blogPost
    })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/blogs/[id] - Update blog post (full update)
export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const params = await context.params
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid blog post ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { title, slug, excerpt, content, published, img, tags } = body

    // Validate required fields
    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if blog post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Check if slug is unique (excluding current post)
    if (slug !== existingPost.slug) {
      const slugExists = await prisma.blogPost.findUnique({
        where: { slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update blog post
    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        content,
        published: published || false,
        img: img || null,
        tags: tags && Array.isArray(tags)
          ? { set: tags.map((id: number) => ({ id })) }
          : undefined
      },
      include: { tags: true }
    })

    return NextResponse.json({
      message: 'Blog post updated successfully',
      blog: updatedPost
    })
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/blogs/[id] - Partial update (e.g., toggle publish status)
export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const params = await context.params
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid blog post ID' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Check if blog post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Whitelist allowed fields to prevent mass assignment
    const allowedFields = ['title', 'content', 'excerpt', 'img', 'published', 'metaTitle', 'metaDescription'];
    const safeData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) safeData[field] = body[field];
    }
    if (safeData.title) {
      safeData.slug = safeData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: safeData
    })

    return NextResponse.json({
      message: 'Blog post updated successfully',
      blog: updatedPost
    })
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/blogs/[id] - Delete blog post
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const params = await context.params
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid blog post ID' },
        { status: 400 }
      )
    }

    // Check if blog post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Delete blog post
    await prisma.blogPost.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Blog post deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
