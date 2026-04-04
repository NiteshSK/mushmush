import { prisma } from './prisma';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { put } from '@vercel/blob';
import path from 'path';
import fs from 'fs';

export interface InvoiceData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  billingAddress: any;
  shippingAddress: any;
  subtotal: number;
  tax: number; // Used as convenience fee
  shipping: number;
  total: number;
  orderItems: Array<{
    productTitle: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  orderDate: Date;
}

/**
 * Generate invoice number in format: INV-YYYYMMDD-XXXXX
 */
export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `INV-${year}${month}${day}-${random}`;
}

/**
 * Generate PDF invoice and upload to Vercel Blob Storage
 * Path format: userId/YYYY-MM-DD/invoiceNumber.pdf
 */
export async function generateInvoicePDF(data: InvoiceData, userId?: string): Promise<string> {
  const doc = new jsPDF();

  // Add logo
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo', 'logo.png');
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      doc.addImage(logoBase64, 'PNG', 15, 10, 25, 25);
    }
  } catch (error) {
  }

  // Company Header with updated branding
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(92, 142, 97); // Kosvana forest green
  doc.text('Kosvana', 105, 20, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('by Mush Agro Products', 105, 27, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Premium Mushrooms, Dry Fruits, Seeds & Spices', 105, 33, { align: 'center' });
  doc.text('Email: mushagroprod@gmail.com | Phone: +91-7618362662', 105, 38, { align: 'center' });

  // Invoice Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', 105, 52, { align: 'center' });

  // Invoice Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const invoiceNumber = generateInvoiceNumber();
  doc.text(`Invoice Number: ${invoiceNumber}`, 20, 65);
  doc.text(`Order Number: ${data.orderNumber}`, 20, 71);

  // Format date with timestamp
  const orderDate = new Date(data.orderDate);
  const formattedDate = orderDate.toLocaleString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  doc.text(`Date: ${formattedDate}`, 20, 77);

  // Billing Information (Left Side)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(45, 80, 22);
  doc.text('Bill To:', 20, 90);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(data.customerName, 20, 96);
  doc.text(data.customerEmail, 20, 101);
  if (data.customerPhone) {
    doc.text(data.customerPhone, 20, 106);
  }

  // Billing Address
  const billingAddr = data.billingAddress;
  let billYPos = data.customerPhone ? 111 : 106;
  doc.text(`${billingAddr.address || billingAddr.street || ''}`, 20, billYPos);
  billYPos += 5;
  doc.text(`${billingAddr.city || ''}, ${billingAddr.state || ''} ${billingAddr.zipCode || billingAddr.zip || ''}`, 20, billYPos);
  billYPos += 5;
  doc.text(`${billingAddr.country || 'India'}`, 20, billYPos);

  // Shipping Address (Right Side)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(45, 80, 22);
  doc.text('Ship To:', 110, 90);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(data.customerName, 110, 96);

  // Shipping Address Details
  const shippingAddr = data.shippingAddress;
  let shipYPos = 101;
  doc.text(`${shippingAddr.address || shippingAddr.street || ''}`, 110, shipYPos);
  shipYPos += 5;
  doc.text(`${shippingAddr.city || ''}, ${shippingAddr.state || ''} ${shippingAddr.zipCode || shippingAddr.zip || ''}`, 110, shipYPos);
  shipYPos += 5;
  doc.text(`${shippingAddr.country || 'India'}`, 110, shipYPos);

  // Items Table - start after both addresses
  const tableStartY = Math.max(billYPos, shipYPos) + 15;

  autoTable(doc, {
    startY: tableStartY,
    head: [['Item', 'Quantity', 'Price', 'Total']],
    body: data.orderItems.map(item => [
      item.productTitle,
      item.quantity.toString(),
      `Rs ${item.price.toFixed(2)}`,  // Using Rs instead of ₹ symbol
      `Rs ${item.total.toFixed(2)}`   // Using Rs instead of ₹ symbol
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [92, 142, 97], // Kosvana forest green
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
      font: 'helvetica',
      fontStyle: 'normal'
    },
    columnStyles: {
      0: { cellWidth: 80, halign: 'left' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 35, halign: 'right', fontStyle: 'normal' },
      3: { cellWidth: 35, halign: 'right', fontStyle: 'normal' }
    }
  });

  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 50;

  // Totals - Compact version with smaller font
  const totalsX = 135;
  let totalsY = finalY + 12;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Subtotal:', totalsX, totalsY);
  doc.text(`Rs ${data.subtotal.toFixed(2)}`, 185, totalsY, { align: 'right' });

  totalsY += 5;
  doc.text('Convenience Fee:', totalsX, totalsY);
  doc.text(`Rs ${data.tax.toFixed(2)}`, 185, totalsY, { align: 'right' });

  totalsY += 5;
  doc.text('Shipping:', totalsX, totalsY);
  doc.text(`Rs ${data.shipping.toFixed(2)}`, 185, totalsY, { align: 'right' });

  // Total with slightly larger font and line separator
  totalsY += 2;
  doc.setDrawColor(45, 80, 22);
  doc.line(totalsX, totalsY, 185, totalsY);

  totalsY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(45, 80, 22);
  doc.text('Total:', totalsX, totalsY);
  doc.text(`Rs ${data.total.toFixed(2)}`, 185, totalsY, { align: 'right' });

  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for your business!', 105, 270, { align: 'center' });
  doc.text('For any queries, please contact us at mushagroprod@gmail.com', 105, 276, { align: 'center' });

  // Generate PDF buffer
  const pdfBuffer = doc.output('arraybuffer');
  const fileName = `${invoiceNumber}.pdf`;

  // Create structured path: userId/YYYY-MM-DD/invoiceNumber.pdf
  const date = new Date();
  const dateFolder = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  const userFolder = userId || 'guest';
  const blobPath = `invoices/${userFolder}/${dateFolder}/${fileName}`;


  // Upload to Vercel Blob with structured path
  try {
    const blob = await put(blobPath, Buffer.from(pdfBuffer), {
      access: 'public',
      contentType: 'application/pdf',
    });

    return blob.url;
  } catch (error) {
    console.error('❌ Error uploading PDF to Vercel Blob:', error);
    throw new Error('Failed to upload invoice PDF to cloud storage');
  }
}

/**
 * Generate invoice record in database and create PDF
 */
export async function generateInvoice(orderId: string): Promise<any> {
  try {

    // Fetch order with all details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                title: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      throw new Error('Order not found');
    }


    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { orderId }
    });

    if (existingInvoice) {
      return existingInvoice;
    }

    // Fetch shipping address separately
    let shippingAddressData = {
      address: 'N/A',
      city: 'N/A',
      state: 'N/A',
      zipCode: 'N/A',
      country: 'India'
    };

    if (order.shippingAddressId) {
      try {
        const shippingAddr = await prisma.addresses.findUnique({
          where: { id: order.shippingAddressId }
        });

        if (shippingAddr) {
          shippingAddressData = {
            address: shippingAddr.street,
            city: shippingAddr.city,
            state: shippingAddr.state,
            zipCode: shippingAddr.zip,
            country: shippingAddr.country
          };
        }
      } catch (error) {
        console.error('⚠️ Error loading shipping address:', error);
      }
    }

    // Prepare invoice data
    const invoiceData: InvoiceData = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone || undefined,
      billingAddress: shippingAddressData, // Using shipping as billing for now
      shippingAddress: shippingAddressData,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      orderItems: order.orderItems.map(item => ({
        productTitle: item.product.title,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      })),
      orderDate: order.createdAt
    };

    // Generate PDF and upload to Vercel Blob with structured path
    const blobUrl = await generateInvoicePDF(invoiceData, order.userId || undefined);
    // Extract invoice number from the blob URL (format: https://...blob.vercel-storage.com/invoices/userId/date/INV-XXX.pdf)
    const invoiceNumber = blobUrl.split('/').pop()?.replace('.pdf', '') || generateInvoiceNumber();

    // Create invoice record with Blob URL
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        pdfPath: blobUrl, // Store the Vercel Blob URL
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        billingAddress: shippingAddressData,
        shippingAddress: shippingAddressData,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        invoiceItems: invoiceData.orderItems,
        generatedAt: new Date()
      }
    });

    return invoice;

  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
}

/**
 * Get invoice by order ID
 */
export async function getInvoiceByOrderId(orderId: string) {
  return await prisma.invoice.findUnique({
    where: { orderId },
    include: {
      order: {
        select: {
          orderNumber: true,
          status: true,
          createdAt: true,
          userId: true
        }
      }
    }
  });
}

/**
 * Get invoice by invoice ID
 */
export async function getInvoiceById(invoiceId: string) {
  return await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      order: {
        select: {
          orderNumber: true,
          status: true,
          createdAt: true,
          userId: true
        }
      }
    }
  });
}

/**
 * Mark invoice email as sent
 */
export async function markInvoiceEmailSent(invoiceId: string) {
  return await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      emailSent: true,
      emailSentAt: new Date()
    }
  });
}
