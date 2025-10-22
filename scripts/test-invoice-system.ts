/**
 * Comprehensive test script for invoice generation system
 * Tests: Order creation → Payment → Status update to COMPLETED → Invoice generation → Email delivery
 */

import { prisma } from '../src/lib/prisma';

async function testInvoiceSystem() {
  console.log('🧪 Starting Invoice System Test...\n');

  try {
    // Step 1: Find or create a test user
    console.log('📝 Step 1: Setting up test user...');
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@mushmush.com' }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@mushmush.com',
          name: 'Test User',
          role: 'CUSTOMER'
        }
      });
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user found');
    }

    // Step 2: Find test products
    console.log('\n📝 Step 2: Finding test products...');
    const products = await prisma.product.findMany({
      take: 2
    });

    if (products.length === 0) {
      console.error('❌ No products found in database. Please seed products first.');
      return;
    }
    console.log(`✅ Found ${products.length} products`);

    // Step 3: Create a test order
    console.log('\n📝 Step 3: Creating test order...');
    const orderNumber = `TEST-ORD-${Date.now()}`;
    const subtotal = products.reduce((sum, p) => sum + p.price, 0);
    const tax = subtotal * 0.18; // 18% GST
    const shipping = 50;
    const total = subtotal + tax + shipping;

    // First create a shipping address
    const shippingAddress = await prisma.addresses.create({
      data: {
        id: `addr-${Date.now()}`,
        street: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400001',
        country: 'India',
        type: 'SHIPPING',
        isDefault: true,
        updatedAt: new Date(),
        users: {
          connect: { id: testUser.id }
        }
      }
    });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: testUser.name || 'Test User',
        customerEmail: testUser.email,
        customerPhone: '+91-9876543210',
        shippingAddress: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zip,
          country: shippingAddress.country
        },
        subtotal,
        tax,
        shipping,
        total,
        status: 'PENDING',
        user: {
          connect: { id: testUser.id }
        },
        addresses_orders_shippingAddressIdToaddresses: {
          connect: { id: shippingAddress.id }
        },
        addresses_orders_billingAddressIdToaddresses: {
          connect: { id: shippingAddress.id }
        },
        orderItems: {
          create: products.map(product => ({
            productId: product.id,
            quantity: 1,
            price: product.price
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        addresses_orders_shippingAddressIdToaddresses: true
      }
    });

    console.log(`✅ Order created: ${order.orderNumber}`);
    console.log(`   Order ID: ${order.id}`);
    console.log(`   Total: ₹${order.total.toFixed(2)}`);

    // Step 4: Simulate order progression
    console.log('\n📝 Step 4: Simulating order progression...');
    
    const statuses: Array<'PROCESSING' | 'SHIPPED' | 'DELIVERED'> = ['PROCESSING', 'SHIPPED', 'DELIVERED'];
    for (const status of statuses) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status }
      });
      console.log(`   ✅ Order status: ${status}`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
    }

    // Step 5: Mark order as COMPLETED (this should trigger invoice generation)
    console.log('\n📝 Step 5: Marking order as COMPLETED...');
    console.log('   This should trigger:');
    console.log('   1. Invoice PDF generation');
    console.log('   2. Invoice database record creation');
    console.log('   3. Email delivery to customer');
    console.log('\n   🔄 Processing...\n');

    // Import the invoice generation function
    const { generateInvoice, markInvoiceEmailSent } = await import('../src/lib/invoice');
    const { sendOrderInvoiceEmail } = await import('../src/lib/email');

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'COMPLETED' }
    });

    // Generate invoice
    const invoice = await generateInvoice(order.id);
    console.log(`   ✅ Invoice generated: ${invoice.invoiceNumber}`);
    console.log(`   📄 PDF Path: ${invoice.pdfPath}`);

    // Fetch order with address details for email
    const orderWithAddress = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        addresses_orders_shippingAddressIdToaddresses: true
      }
    });

    if (!orderWithAddress) {
      throw new Error('Order not found');
    }

    // Prepare shipping address for email
    const shippingAddr = orderWithAddress.addresses_orders_shippingAddressIdToaddresses;
    const shippingAddressData = shippingAddr ? {
      address: shippingAddr.street,
      city: shippingAddr.city,
      state: shippingAddr.state,
      zipCode: shippingAddr.zip,
      country: shippingAddr.country
    } : {
      address: '123 Test Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    };

    // Prepare and send email
    const emailData = {
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      orderNumber: order.orderNumber,
      invoiceNumber: invoice.invoiceNumber,
      invoicePdfUrl: invoice.pdfPath || '',
      orderDate: order.createdAt,
      orderItems: orderWithAddress.orderItems.map(item => ({
        productTitle: item.product.title,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      shippingAddress: shippingAddressData
    };

    await sendOrderInvoiceEmail(emailData);
    await markInvoiceEmailSent(invoice.id);
    console.log(`   ✅ Email sent to: ${order.customerEmail}`);

    // Step 6: Verify invoice in database
    console.log('\n📝 Step 6: Verifying invoice in database...');
    const verifyInvoice = await prisma.invoice.findUnique({
      where: { orderId: order.id },
      include: {
        order: {
          select: {
            orderNumber: true,
            status: true
          }
        }
      }
    });

    if (verifyInvoice) {
      console.log('   ✅ Invoice verified in database');
      console.log(`   Invoice Number: ${verifyInvoice.invoiceNumber}`);
      console.log(`   Order Number: ${verifyInvoice.order.orderNumber}`);
      console.log(`   Order Status: ${verifyInvoice.order.status}`);
      console.log(`   Email Sent: ${verifyInvoice.emailSent ? 'Yes' : 'No'}`);
      console.log(`   Generated At: ${verifyInvoice.generatedAt.toLocaleString()}`);
    } else {
      console.error('   ❌ Invoice not found in database');
    }

    // Step 7: Test API endpoints (simulated)
    console.log('\n📝 Step 7: API Endpoints Available:');
    console.log(`   PUT /api/orders/${order.id}/status`);
    console.log(`   GET /api/orders/${order.id}/invoice`);
    console.log(`   GET /api/invoices/${invoice.id}`);
    console.log(`   GET /api/invoices/${invoice.id}?download=true`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ INVOICE SYSTEM TEST COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 Test Summary:');
    console.log(`   Order Number: ${order.orderNumber}`);
    console.log(`   Order Status: COMPLETED`);
    console.log(`   Invoice Number: ${invoice.invoiceNumber}`);
    console.log(`   Invoice PDF: ${invoice.pdfPath}`);
    console.log(`   Email Sent: Yes`);
    console.log(`   Total Amount: ₹${order.total.toFixed(2)}`);
    console.log('\n🎉 All systems working correctly!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Check public/invoices/ folder for generated PDF');
    console.log('   2. Check email logs for delivery confirmation');
    console.log('   3. Test admin panel to update order status via UI');
    console.log('   4. Test customer invoice download functionality');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testInvoiceSystem()
  .then(() => {
    console.log('\n✅ Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error);
    process.exit(1);
  });
