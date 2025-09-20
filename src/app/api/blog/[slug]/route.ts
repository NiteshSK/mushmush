import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/blog/[slug] - Fetch single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    console.log('API: Fetching blog post for slug:', slug)

    if (!slug) {
      console.log('API: No slug provided')
      return NextResponse.json(
        { error: 'Blog slug is required' },
        { status: 400 }
      )
    }

    const blogPost = await prisma.blogPost.findUnique({
      where: { slug }
    })

    if (!blogPost) {
      console.log('API: Blog post not found for slug:', slug)
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    console.log('API: Found blog post:', blogPost.title)

    return NextResponse.json({
      success: true,
      blogPost
    })
  } catch (error) {
    console.error('API: Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}

// POST /api/blog/[slug] - Update blog post (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()

    console.log('API: Updating blog post for slug:', slug)

    if (!slug) {
      return NextResponse.json(
        { error: 'Blog slug is required' },
        { status: 400 }
      )
    }

    const updatedBlog = await prisma.blogPost.update({
      where: { slug },
      data: body
    })

    return NextResponse.json({
      success: true,
      blogPost: updatedBlog
    })
  } catch (error) {
    console.error('API: Error updating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}
