import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/news/[slug] - Fetch a single news article by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const incrementViews = searchParams.get('incrementViews') === 'true';
    
    const news = await prisma.news.findUnique({
      where: {
        slug: slug,
        published: true
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

    if (!news) {
      return NextResponse.json(
        { error: 'News article not found' },
        { status: 404 }
      )
    }

    // Only increment view count if explicitly requested
    if (incrementViews) {
      await prisma.news.update({
        where: { id: news.id },
        data: { views: { increment: 1 } }
      })
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
