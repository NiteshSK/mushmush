import { canWork } from "@/lib/staff-permissions";
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkClientTotal, priceOrder, pricingErrorBody } from '@/lib/order-pricing'

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
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 10))
    const skip = (page - 1) * limit

    const where: any = {}
    
    // CRITICAL SECURITY: Non-admin users can ONLY see their own orders
    if (canWork(session.user, "finance", "fulfillment")) {
      const query = searchParams.get("q")?.trim().slice(0, 100);
      if (query) where.OR = [
        { orderNumber: { contains: query, mode: "insensitive" } },
        { upi_payments: { some: { transactionId: { contains: query, mode: "insensitive" } } } }
      ];
      if (searchParams.get("delivery") === "fresh") {
        where.orderItems = { some: { product: { fulfillmentClass: "fresh" } } };
        where.status = { in: ["CONFIRMED", "PROCESSING", "SHIPPED"] };
      }
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
                  fulfillmentClass: true,
                  measurementType: true,
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
              proof: { select: { paymentId: true } },
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
      couponCode,
      // Only used to detect a mismatch with what the shopper saw. Client
      // subtotal, tax, shipping and per-item price are ignored.
      total: clientTotal
    } = body

    const name = customerName || session.user.name
    const email = customerEmail || session.user.email
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Customer name and email are required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 })
    }

    if (couponCode) {
      // Coupon usage is recorded only by the checkout route
      return NextResponse.json(
        { error: 'Coupons are not supported on this endpoint. Use checkout instead.' },
        { status: 400 }
      )
    }

    // Authoritative server-side pricing (same function as checkout)
    const pricingResult = await priceOrder({
      items: orderItems.map((item: any) => ({ productId: item?.productId, quantity: item?.quantity })),
      pincode: shippingAddress?.zip || shippingAddress?.postalCode,
    })
    if (pricingResult.ok === false) {
      return NextResponse.json(pricingErrorBody(pricingResult), { status: pricingResult.status })
    }
    const pricing = pricingResult.pricing

    const totalMismatch = checkClientTotal(clientTotal, pricing)
    if (totalMismatch) {
      return NextResponse.json(totalMismatch.body, { status: totalMismatch.status })
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

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
        customerName: name,
        customerEmail: email,
        customerPhone,
        shippingAddress: shippingAddressJson,
        shippingAddressId,
        subtotal: pricing.subtotal,
        tax: pricing.convenienceFee, // Convenience fee stored in tax field
        shipping: pricing.shippingFee,
        couponDiscount: 0,
        total: pricing.total,
        orderItems: {
          create: pricing.items.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            price: line.unitPrice // server price incl. active product discount
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
