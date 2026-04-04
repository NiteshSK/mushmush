import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/blog/[slug]/views - Increment blog views
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params


    if (!slug) {
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
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }


    // Increment the view count for the blog post
    const updatedBlog = await prisma.blogPost.update({
      where: { slug },
      data: {
        views: {
          increment: 1
        }
      }
    })


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
