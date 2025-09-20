import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/blog/[slug]/views - Increment blog views
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    console.log('API: Received request to increment views for slug:', slug)

    if (!slug) {
      console.log('API: No slug provided')
      return NextResponse.json(
        { error: 'Blog slug is required' },
        { status: 400 }
      )
    }

    // Check if blog post exists first
    const existingBlog = await prisma.blogPost.findUnique({
      where: { slug }
    })

    if (!existingBlog) {
      console.log('API: Blog post not found for slug:', slug)
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    console.log('API: Found blog post, current views:', existingBlog.views)

    // Increment the view count for the blog post
    const updatedBlog = await prisma.blogPost.update({
      where: { slug },
      data: {
        views: {
          increment: 1
        }
      }
    })

    console.log('API: Successfully incremented views. New count:', updatedBlog.views)

    return NextResponse.json({
      success: true,
      views: updatedBlog.views
    })
  } catch (error) {
    console.error('API: Error incrementing blog views:', error)
    return NextResponse.json(
      { error: 'Failed to increment blog views' },
      { status: 500 }
    )
  }
}
