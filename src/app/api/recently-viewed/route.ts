import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/recently-viewed - Get user's recently viewed products
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ items: [] })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ items: [] })
    }

    const recentlyViewed = await prisma.recentlyViewed.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            categories: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    })

    return NextResponse.json({ items: recentlyViewed })
  } catch (error) {
    console.error('Error fetching recently viewed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recently viewed products' },
      { status: 500 }
    )
  }
}

// POST /api/recently-viewed - Add product to recently viewed
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Upsert recently viewed (update timestamp if exists, create if not)
    const recentlyViewed = await prisma.recentlyViewed.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId: parseInt(productId)
        }
      },
      update: {
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        productId: parseInt(productId)
      }
    })

    // Keep only top 5 most recent items per user
    const userRecentlyViewed = await prisma.recentlyViewed.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      skip: 5 // Skip the first 5 (most recent)
    })

    // Delete older entries beyond the 5 most recent
    if (userRecentlyViewed.length > 0) {
      await prisma.recentlyViewed.deleteMany({
        where: {
          id: {
            in: userRecentlyViewed.map(item => item.id)
          }
        }
      })
    }

    return NextResponse.json(recentlyViewed)
  } catch (error) {
    console.error('Error adding to recently viewed:', error)
    return NextResponse.json(
      { error: 'Failed to add to recently viewed' },
      { status: 500 }
    )
  }
}
