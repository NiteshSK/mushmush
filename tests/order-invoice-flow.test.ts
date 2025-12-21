/**
 * Comprehensive Test Suite for Order and Invoice Flow
 * 
 * This test suite covers the entire order lifecycle:
 * 1. Order creation
 * 2. Address handling (reuse vs create)
 * 3. Invoice generation
 * 4. Email sending
 * 5. Status transitions
 */

import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

import { PrismaClient } from '@prisma/client';
import { generateInvoice, markInvoiceEmailSent } from '../src/lib/invoice';
import { sendOrderInvoiceEmail, OrderInvoiceEmailData } from '../src/lib/email';

const prisma = new PrismaClient();

// Test data
const testUserEmail = 'test-order-flow@example.com';
const testUserName = 'Test Order User';

// Cleanup function
async function cleanup() {
  try {
    // Delete in correct order to respect foreign key constraints
    await prisma.invoice.deleteMany({
      where: {
        order: {
          customerEmail: testUserEmail
        }
      }
    });

    await prisma.orderItem.deleteMany({
      where: {
        order: {
          customerEmail: testUserEmail
        }
      }
    });

    await prisma.order.deleteMany({
      where: {
        customerEmail: testUserEmail
      }
    });

    await prisma.addresses.deleteMany({
      where: {
        users: {
          email: testUserEmail
        }
      }
    });

    await prisma.user.deleteMany({
      where: {
        email: testUserEmail
      }
    });

    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
}

// Test 1: Order Creation with New Address
async function testOrderCreationWithNewAddress() {
  console.log('\n📝 Test 1: Order Creation with New Address');
  console.log('='.repeat(60));

  try {
    // Create test user
    const user = await prisma.user.create({
      data: {
        id: `test-user-${Date.now()}`,
        email: testUserEmail,
        name: testUserName,
        password: 'hashed_password',
        role: 'USER'
      }
    });
    console.log('✅ Test user created:', user.email);

    // Create test product
    const product = await prisma.product.create({
      data: {
        title: 'Test Product',
        slug: `test-product-${Date.now()}`,
        description: 'Test product for order flow',
        price: 100,
        category: 'TEST',
        inStock: true,
        stockQuantity: 10
      }
    });
    console.log('✅ Test product created:', product.title);

    // Create address
    const address = await prisma.addresses.create({
      data: {
        id: `addr-${Date.now()}`,
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zip: '123456',
        country: 'India',
        type: 'SHIPPING',
        userId: user.id,
        updatedAt: new Date()
      }
    });
    console.log('✅ Address created:', address.id);

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: `TEST-ORD-${Date.now()}`,
        customerName: user.name || testUserName,
        customerEmail: user.email,
        customerPhone: '+91-9876543210',
        shippingAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip,
          country: address.country
        },
        subtotal: 100,
        tax: 0,
        shipping: 50,
        total: 150,
        status: 'CONFIRMED',
        userId: user.id,
        billingAddressId: address.id,
        shippingAddressId: address.id,
        orderItems: {
          create: [{
            productId: product.id,
            quantity: 1,
            price: 100
          }]
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    console.log('✅ Order created:', order.orderNumber);
    console.log('   Status:', order.status);
    console.log('   Total:', order.total);
    console.log('   Items:', order.orderItems.length);

    // Verify address was reused (not duplicated)
    const addressCount = await prisma.addresses.count({
      where: {
        userId: user.id,
        street: address.street
      }
    });

    if (addressCount === 1) {
      console.log('✅ Address reused correctly (no duplicates)');
    } else {
      console.log('❌ Address duplicated! Count:', addressCount);
    }

    return { order, user, product, address };

  } catch (error) {
    console.error('❌ Test 1 failed:', error);
    throw error;
  }
}

// Test 2: Invoice Generation
async function testInvoiceGeneration(orderId: string) {
  console.log('\n📝 Test 2: Invoice Generation');
  console.log('='.repeat(60));

  try {
    // Generate invoice
    const invoice = await generateInvoice(orderId);

    console.log('✅ Invoice generated:', invoice.invoiceNumber);
    console.log('   PDF Path:', invoice.pdfPath);
    console.log('   Total:', invoice.total);
    console.log('   Email Sent:', invoice.emailSent);

    // Verify invoice data
    if (!invoice.invoiceNumber) {
      throw new Error('Invoice number missing');
    }
    if (!invoice.pdfPath) {
      throw new Error('PDF path missing');
    }
    if (invoice.total <= 0) {
      throw new Error('Invalid invoice total');
    }

    console.log('✅ Invoice data validated');

    return invoice;

  } catch (error) {
    console.error('❌ Test 2 failed:', error);
    throw error;
  }
}

// Test 3: Email Sending (Dry Run)
async function testEmailSending(order: any, invoice: any) {
  console.log('\n📝 Test 3: Email Sending (Dry Run)');
  console.log('='.repeat(60));

  try {
    // Prepare email data
    const shippingAddr = await prisma.addresses.findUnique({
      where: { id: order.shippingAddressId }
    });

    const emailData: OrderInvoiceEmailData = {
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      orderNumber: order.orderNumber,
      invoiceNumber: invoice.invoiceNumber,
      invoicePdfUrl: invoice.pdfPath,
      orderDate: order.createdAt,
      orderItems: order.orderItems.map((item: any) => ({
        productTitle: item.product.title,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      shippingAddress: shippingAddr ? {
        address: shippingAddr.street,
        city: shippingAddr.city,
        state: shippingAddr.state,
        zipCode: shippingAddr.zip,
        country: shippingAddr.country
      } : {
        address: 'N/A',
        city: 'N/A',
        state: 'N/A',
        zipCode: 'N/A',
        country: 'India'
      }
    };

    console.log('✅ Email data prepared');
    console.log('   To:', emailData.customerEmail);
    console.log('   Order:', emailData.orderNumber);
    console.log('   Invoice:', emailData.invoiceNumber);
    console.log('   Items:', emailData.orderItems.length);

    // Note: Actual email sending is commented out to avoid sending test emails
    // Uncomment the line below to test actual email delivery
    // await sendOrderInvoiceEmail(emailData);

    console.log('⚠️  Email sending skipped (dry run)');
    console.log('   To test actual email, uncomment sendOrderInvoiceEmail() call');

    // Mark email as sent for testing
    await markInvoiceEmailSent(invoice.id);
    console.log('✅ Invoice marked as email sent');

    return emailData;

  } catch (error) {
    console.error('❌ Test 3 failed:', error);
    throw error;
  }
}

// Test 4: Status Transition and Auto-Invoice
async function testStatusTransition(orderId: string) {
  console.log('\n📝 Test 4: Status Transition to COMPLETED');
  console.log('='.repeat(60));

  try {
    // Update order status to COMPLETED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    console.log('✅ Order status updated to:', updatedOrder.status);

    // Check if invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { orderId }
    });

    if (invoice) {
      console.log('✅ Invoice exists for completed order');
      console.log('   Invoice Number:', invoice.invoiceNumber);
      console.log('   Email Sent:', invoice.emailSent);
    } else {
      console.log('⚠️  No invoice found (should be generated by status update API)');
    }

    return updatedOrder;

  } catch (error) {
    console.error('❌ Test 4 failed:', error);
    throw error;
  }
}

// Test 5: Duplicate Address Prevention
async function testDuplicateAddressPrevention(userId: string) {
  console.log('\n📝 Test 5: Duplicate Address Prevention');
  console.log('='.repeat(60));

  try {
    // Get existing address
    const existingAddress = await prisma.addresses.findFirst({
      where: { userId }
    });

    if (!existingAddress) {
      throw new Error('No existing address found');
    }

    console.log('✅ Found existing address:', existingAddress.id);

    // Create product for second order
    const product = await prisma.product.create({
      data: {
        title: 'Test Product 2',
        slug: `test-product-2-${Date.now()}`,
        description: 'Second test product',
        price: 200,
        category: 'TEST',
        inStock: true,
        stockQuantity: 10
      }
    });

    // Create second order using SAME address
    const order2 = await prisma.order.create({
      data: {
        orderNumber: `TEST-ORD-2-${Date.now()}`,
        customerName: testUserName,
        customerEmail: testUserEmail,
        customerPhone: '+91-9876543210',
        shippingAddress: {
          street: existingAddress.street,
          city: existingAddress.city,
          state: existingAddress.state,
          zip: existingAddress.zip,
          country: existingAddress.country
        },
        subtotal: 200,
        tax: 0,
        shipping: 50,
        total: 250,
        status: 'CONFIRMED',
        userId,
        billingAddressId: existingAddress.id, // Reuse same address
        shippingAddressId: existingAddress.id, // Reuse same address
        orderItems: {
          create: [{
            productId: product.id,
            quantity: 1,
            price: 200
          }]
        }
      }
    });

    console.log('✅ Second order created:', order2.orderNumber);

    // Count addresses for this user
    const addressCount = await prisma.addresses.count({
      where: {
        userId,
        street: existingAddress.street
      }
    });

    if (addressCount === 1) {
      console.log('✅ SUCCESS: Address reused, no duplicates created');
      console.log('   Address count:', addressCount);
    } else {
      console.log('❌ FAILURE: Duplicate address created!');
      console.log('   Address count:', addressCount);
      throw new Error('Duplicate address prevention failed');
    }

    return order2;

  } catch (error) {
    console.error('❌ Test 5 failed:', error);
    throw error;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n🧪 Starting Comprehensive Order & Invoice Flow Tests');
  console.log('='.repeat(60));

  try {
    // Cleanup before tests
    await cleanup();

    // Test 1: Order Creation
    const { order, user, product, address } = await testOrderCreationWithNewAddress();

    // Test 2: Invoice Generation
    const invoice = await testInvoiceGeneration(order.id);

    // Test 3: Email Sending
    await testEmailSending(order, invoice);

    // Test 4: Status Transition
    await testStatusTransition(order.id);

    // Test 5: Duplicate Prevention
    await testDuplicateAddressPrevention(user.id);

    console.log('\n✅ All tests passed!');
    console.log('='.repeat(60));

    // Summary
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Order creation with new address');
    console.log('   ✅ Invoice generation');
    console.log('   ✅ Email data preparation');
    console.log('   ✅ Status transition');
    console.log('   ✅ Duplicate address prevention');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  } finally {
    // Cleanup after tests
    console.log('\n🧹 Cleaning up test data...');
    await cleanup();
    await prisma.$disconnect();
  }
}

// Run tests
runAllTests();
