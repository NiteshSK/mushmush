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
  couponDiscount: number;
  couponCode?: string | null;
  total: number;
  orderItems: Array<{
    productTitle: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  orderDate: Date;
}

// ─── Brand Colours ───────────────────────────────────────────────────────
const FOREST = [92, 142, 97] as const;  // #5C8E61
const DARK   = [30, 30, 30] as const;
const GRAY   = [120, 120, 120] as const;
const LIGHT  = [245, 245, 245] as const;
const WHITE  = [255, 255, 255] as const;

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
 */
export async function generateInvoicePDF(data: InvoiceData, userId?: string): Promise<string> {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();   // 210
  const pageH = doc.internal.pageSize.getHeight();   // 297
  const marginL = 20;
  const marginR = 20;
  const contentW = pageW - marginL - marginR;

  // ─── WATERMARK — scattered small "Kosvana" across the page ──────────
  const cx = pageW / 2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(18);
  doc.setTextColor(238, 242, 238);  // barely visible sage

  const wmPositions = [
    { x: 30,  y: 60 },  { x: 130, y: 45 },
    { x: 70,  y: 120 }, { x: 155, y: 110 },
    { x: 25,  y: 180 }, { x: 110, y: 170 },
    { x: 60,  y: 235 }, { x: 150, y: 225 },
    { x: 90,  y: 85 },  { x: 40,  y: 150 },
    { x: 140, y: 145 }, { x: 80,  y: 260 },
    { x: 160, y: 270 }, { x: 30,  y: 275 },
  ];
  for (const pos of wmPositions) {
    doc.text('Kosvana', pos.x, pos.y, { angle: 35 });
  }

  // ─── TOP ACCENT BAR ──────────────────────────────────────────────────
  doc.setFillColor(...FOREST);
  doc.rect(0, 0, pageW, 4, 'F');

  // ─── HEADER ──────────────────────────────────────────────────────────
  let y = 16;

  // Logo — wider to let the script-style logo speak for itself
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo', 'logo.png');
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      doc.addImage(logoBase64, 'PNG', marginL, y - 1, 38, 14);
    }
  } catch {}

  // Tagline under logo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text('by Mush Agro Products LLP', marginL, y + 18);
  doc.text('Premium Mushrooms, Dry Fruits, Seeds & Spices', marginL, y + 22);

  // INVOICE label — right-aligned
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...DARK);
  doc.text('INVOICE', pageW - marginR, y + 5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text('mushagroprod@gmail.com | +91-7618362662', pageW - marginR, y + 12, { align: 'right' });
  doc.text('NH 507, Herbertpur, Dehradun 248142', pageW - marginR, y + 17, { align: 'right' });

  // Divider
  y = 42;
  doc.setDrawColor(...FOREST);
  doc.setLineWidth(0.5);
  doc.line(marginL, y, pageW - marginR, y);

  // ─── INVOICE META ────────────────────────────────────────────────────
  y = 50;
  const invoiceNumber = generateInvoiceNumber();

  const orderDate = new Date(data.orderDate);
  const formattedDate = orderDate.toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const formattedTime = orderDate.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  // Meta — two columns
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);

  doc.text('Invoice No.', marginL, y);
  doc.text('Order No.', marginL, y + 6);
  doc.text('Date', marginL, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text(invoiceNumber, marginL + 28, y);
  doc.text(data.orderNumber, marginL + 28, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formattedDate}, ${formattedTime}`, marginL + 28, y + 12);

  // ─── ADDRESSES ───────────────────────────────────────────────────────
  y = 74;
  const addrCol2 = pageW / 2 + 5;

  // Bill To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...FOREST);
  doc.text('BILL TO', marginL, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(data.customerName, marginL, y + 6);

  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(data.customerEmail, marginL, y + 11);
  if (data.customerPhone) doc.text(data.customerPhone, marginL, y + 16);

  const billingAddr = data.billingAddress;
  let bY = y + (data.customerPhone ? 22 : 17);
  doc.text(billingAddr.address || billingAddr.street || '', marginL, bY);
  bY += 4.5;
  doc.text(`${billingAddr.city || ''}, ${billingAddr.state || ''} ${billingAddr.zipCode || billingAddr.zip || ''}`, marginL, bY);
  bY += 4.5;
  doc.text(billingAddr.country || 'India', marginL, bY);

  // Ship To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...FOREST);
  doc.text('SHIP TO', addrCol2, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(data.customerName, addrCol2, y + 6);

  const shippingAddr = data.shippingAddress;
  let sY = y + 12;
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(shippingAddr.address || shippingAddr.street || '', addrCol2, sY);
  sY += 4.5;
  doc.text(`${shippingAddr.city || ''}, ${shippingAddr.state || ''} ${shippingAddr.zipCode || shippingAddr.zip || ''}`, addrCol2, sY);
  sY += 4.5;
  doc.text(shippingAddr.country || 'India', addrCol2, sY);

  // ─── ITEMS TABLE ─────────────────────────────────────────────────────
  const tableStartY = Math.max(bY, sY) + 14;

  autoTable(doc, {
    startY: tableStartY,
    head: [['#', 'Item', 'Qty', 'Unit Price', 'Amount']],
    body: data.orderItems.map((item, idx) => [
      (idx + 1).toString(),
      item.productTitle,
      item.quantity.toString(),
      `Rs. ${item.price.toFixed(2)}`,
      `Rs. ${item.total.toFixed(2)}`
    ]),
    theme: 'plain',
    headStyles: {
      fillColor: [...FOREST] as [number, number, number],
      textColor: [...WHITE] as [number, number, number],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 4, right: 5, bottom: 4, left: 5 },
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: { top: 3.5, right: 5, bottom: 3.5, left: 5 },
      textColor: [...DARK] as [number, number, number],
    },
    alternateRowStyles: {
      fillColor: [...LIGHT] as [number, number, number],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 34, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: marginL, right: marginR },
    tableLineColor: [220, 220, 220],
    tableLineWidth: 0.1,
  });

  // ─── TOTALS ──────────────────────────────────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 50;
  const totalsLabelX = pageW - marginR - 65;
  const totalsValueX = pageW - marginR;
  let tY = finalY + 10;

  const drawTotalRow = (label: string, value: string, opts?: { bold?: boolean; color?: readonly [number, number, number]; large?: boolean }) => {
    doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
    doc.setFontSize(opts?.large ? 10 : 8.5);
    doc.setTextColor(...(opts?.color || DARK));
    doc.text(label, totalsLabelX, tY);
    doc.text(value, totalsValueX, tY, { align: 'right' });
    tY += opts?.large ? 7 : 5.5;
  };

  drawTotalRow('Subtotal', `Rs. ${data.subtotal.toFixed(2)}`);
  drawTotalRow('Convenience Fee', `Rs. ${data.tax.toFixed(2)}`);
  drawTotalRow('Shipping', data.shipping === 0 ? 'FREE' : `Rs. ${data.shipping.toFixed(2)}`);

  if (data.couponDiscount > 0) {
    const couponLabel = data.couponCode ? `Coupon (${data.couponCode})` : 'Coupon Discount';
    drawTotalRow(couponLabel, `- Rs. ${data.couponDiscount.toFixed(2)}`, { color: FOREST });
  }

  // Separator
  doc.setDrawColor(...FOREST);
  doc.setLineWidth(0.5);
  doc.line(totalsLabelX, tY - 2, totalsValueX, tY - 2);
  tY += 3;

  drawTotalRow('Total', `Rs. ${data.total.toFixed(2)}`, { bold: true, color: FOREST, large: true });

  // ─── PAYMENT INFO BOX ────────────────────────────────────────────────
  tY += 4;
  const boxY = tY;
  doc.setFillColor(...LIGHT);
  doc.roundedRect(marginL, boxY, contentW, 16, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...FOREST);
  doc.text('PAYMENT METHOD', marginL + 5, boxY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text('UPI / Online Transfer', marginL + 5, boxY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...FOREST);
  doc.text('AMOUNT PAID', pageW - marginR - 50, boxY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(`Rs. ${data.total.toFixed(2)}`, pageW - marginR - 5, boxY + 12, { align: 'right' });

  // ─── FOOTER ──────────────────────────────────────────────────────────
  // Bottom accent bar
  doc.setFillColor(...FOREST);
  doc.rect(0, pageH - 28, pageW, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text('Thank you for shopping with Kosvana!', cx, pageH - 19, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(200, 220, 200);
  doc.text('For queries: mushagroprod@gmail.com | +91-7618362662 | kosvana.com', cx, pageH - 13, { align: 'center' });
  doc.text('Mush Agro Products LLP | NH 507, Herbertpur, Dehradun, Uttarakhand 248142', cx, pageH - 8, { align: 'center' });

  // ─── UPLOAD ──────────────────────────────────────────────────────────
  const pdfBuffer = doc.output('arraybuffer');
  const fileName = `${invoiceNumber}.pdf`;
  const date = new Date();
  const dateFolder = date.toISOString().split('T')[0];
  const userFolder = userId || 'guest';
  const blobPath = `invoices/${userFolder}/${dateFolder}/${fileName}`;

  try {
    const blob = await put(blobPath, Buffer.from(pdfBuffer), {
      access: 'public',
      contentType: 'application/pdf',
    });
    return blob.url;
  } catch (error) {
    console.error('Error uploading PDF to Vercel Blob:', error);
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
        },
        coupon: {
          select: {
            code: true
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
        console.error('Error loading shipping address:', error);
      }
    }

    // Prepare invoice data
    const invoiceData: InvoiceData = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone || undefined,
      billingAddress: shippingAddressData,
      shippingAddress: shippingAddressData,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      couponDiscount: order.couponDiscount,
      couponCode: order.coupon?.code || null,
      total: order.total,
      orderItems: order.orderItems.map(item => ({
        productTitle: item.product.title,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      })),
      orderDate: order.createdAt
    };

    // Generate PDF and upload to Vercel Blob
    const blobUrl = await generateInvoicePDF(invoiceData, order.userId || undefined);
    const invoiceNumber = blobUrl.split('/').pop()?.replace('.pdf', '') || generateInvoiceNumber();

    // Create invoice record
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        pdfPath: blobUrl,
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
