import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/orders - Fetch orders (with user filtering enforced)
export async function GET(request: NextRequest) {
  try {
    // CRITICAL SECURITY: Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get('userId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    
    // CRITICAL SECURITY: Non-admin users can ONLY see their own orders
    if (session.user.role === 'ADMIN') {
      // Admin can filter by any userId or see all
      if (requestedUserId) {
        where.userId = requestedUserId
      }
    } else {
      // Regular users can ONLY see their own orders
      where.userId = session.user.id
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
          },
          upi_payments: {
            select: {
              id: true,
              status: true,
              amount: true,
              transactionId: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
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

// POST /api/orders - Create new order (authenticated users only)
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json()
    const {
      userId: _userId, // Ignore client-supplied userId
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
    const userId = session.user.id; // Always use authenticated user's ID
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

    // Format shipping address as JSON object
    const shippingAddressJson = shippingAddress 
      ? {
          street: shippingAddress.street || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          zip: shippingAddress.zip || shippingAddress.postalCode || '',
          country: shippingAddress.country || 'India'
        }
      : {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: 'India'
        };

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: shippingAddressJson,
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
