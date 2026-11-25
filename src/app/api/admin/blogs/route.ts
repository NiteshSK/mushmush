import { editorialList } from "@/lib/editorial-admin";
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { staffSession } from "@/lib/admin";

// Helper function to check if user is admin
async function isAdmin() {
  const session = await staffSession("editor")
  return !!session?.user
}

// GET /api/admin/blogs - Fetch all blog posts for admin
export async function GET(request:NextRequest) {
  return editorialList(request,"blogs");
}

// POST /api/admin/blogs - Create new blog post
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
    const { title, slug, excerpt, content, published, img, tags, metaTitle,metaDescription } = body

    // Validate required fields
    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if slug is unique
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug }
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    // Create blog post
    const blogPost = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        published: published || false,
        img: img || null,
        views: 0,
        metaTitle,metaDescription,
        tags: tags && Array.isArray(tags)
          ? { connect: tags.map((id: number) => ({ id })) }
          : undefined
      },
      include: { tags: true }
    })

    return NextResponse.json({
      message: 'Blog post created successfully',
      blog: blogPost
    })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
