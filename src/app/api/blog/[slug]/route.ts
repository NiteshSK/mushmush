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
