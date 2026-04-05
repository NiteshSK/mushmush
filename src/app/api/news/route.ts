import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/news - Fetch published news for public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const skip = (page - 1) * limit

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where: {
          published: true
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          img: true,
          sourceUrl: true, // Add this line
          views: true,
          createdAt: true,
          tags: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      prisma.news.count({
        where: {
          published: true
        }
      })
    ])

    return NextResponse.json({
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}