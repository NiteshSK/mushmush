import { publishStory } from "@/lib/editorial-admin";
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { staffSession } from "@/lib/admin";

// Helper function to check if user is admin
async function isAdmin() {
  const session = await staffSession("editor")
  return !!session?.user
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
        metaTitle:true,
        metaDescription:true,
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
    const version = body.expectedUpdatedAt ? new Date(body.expectedUpdatedAt) : undefined;
    if (version && !Number.isFinite(version.getTime())) return NextResponse.json({error:"Invalid saved version."},{status:400});
    const { title, slug, excerpt, content, published, img, tags, metaTitle,metaDescription } = body

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
      where: { id, updatedAt:version },
      data: {
        title,
        slug,
        excerpt,
        content,
        published: published || false,
        img: img || null,
        metaTitle,metaDescription,
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
    if ((error as {code?:string})?.code==="P2025") return NextResponse.json({error:"This story was changed by another editor. Reload before saving."},{status:409});
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/blogs/[id] - Partial update (e.g., toggle publish status)
export async function PATCH(request:NextRequest,context:{params:Promise<{id:string}>}) {
  return publishStory(request, Number((await context.params).id), "blogs");
}

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
