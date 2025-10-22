import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/orders - Fetch orders (with optional user filtering)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (userId) {
      where.userId = userId
    }
    
    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  imgs: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.order.count({ where })
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      orderItems,
      subtotal,
      tax,
      shipping
    } = body

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    const total = subtotal + tax + shipping

    // Create shipping address if provided
    let shippingAddressId: string | undefined;
    if (shippingAddress && userId) {
      const address = await prisma.addresses.create({
        data: {
          id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          street: shippingAddress.street || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          zip: shippingAddress.zip || shippingAddress.postalCode || '',
          country: shippingAddress.country || 'India',
          type: 'SHIPPING',
          userId,
          updatedAt: new Date()
        }
      });
      shippingAddressId = address.id;
    }

    // Format shipping address string
    const shippingAddressString = shippingAddress 
      ? `${shippingAddress.street || ''}, ${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zip || shippingAddress.postalCode || ''}, ${shippingAddress.country || 'India'}`
      : 'No address provided';

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: shippingAddressString,
        shippingAddressId,
        subtotal,
        tax,
        shipping,
        total,
        orderItems: {
          create: orderItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
