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
    originalPrice?: number;
    total: number;
  }>;
  productDiscount?: number;
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
  doc.text('concierge@kosvana.com | +91-7618362662', pageW - marginR, y + 12, { align: 'right' });
  doc.text('NH 507, Herbertpur, Dehradun 248142', pageW - marginR, y + 17, { align: 'right' });

  // Divider
  y = 42;
  doc.setDrawColor(...FOREST);
  doc.setLineWidth(0.5);
  doc.line(marginL, y, pageW - marginR, y);

  // ─── INVOICE META + PAYMENT — side by side ────────────────────────────
  y = 48;
  const invoiceNumber = generateInvoiceNumber();
  const orderDate = new Date(data.orderDate);
  const formattedDate = orderDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const midX = pageW / 2;

  // Left: Invoice details
  const metaLabelX = marginL;
  const metaValueX = marginL + 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...FOREST);
  doc.text('INVOICE DETAILS', metaLabelX, y);

  y += 7;
  const metaRows = [
    ['Invoice No.', invoiceNumber],
    ['Order No.', data.orderNumber],
    ['Date', `${formattedDate}, ${formattedTime}`],
    ['Payment', 'UPI / Online Transfer'],
  ];
  for (const [label, value] of metaRows) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(label, metaLabelX, y);
    doc.setFont('helvetica', label === 'Invoice No.' || label === 'Order No.' ? 'bold' : 'normal');
    doc.setTextColor(...DARK);
    doc.text(value, metaValueX, y);
    y += 5;
  }

  // Right: Amount summary box
  const boxX = midX + 10;
  const boxW = pageW - marginR - boxX;
  const boxTop = 48;
  doc.setFillColor(...LIGHT);
  doc.roundedRect(boxX, boxTop, boxW, 28, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...FOREST);
  doc.text('TOTAL PAID', boxX + 5, boxTop + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text(`Rs. ${data.total.toFixed(2)}`, boxX + 5, boxTop + 19);

  // ─── ADDRESSES — side by side in boxes ────────────────────────────────
  y = 82;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);

  const addrW = (contentW - 6) / 2;
  const addrCol2X = marginL + addrW + 6;

  // Bill To box
  doc.setFillColor(252, 252, 252);
  doc.roundedRect(marginL, y, addrW, 32, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...FOREST);
  doc.text('BILL TO', marginL + 4, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  doc.text(data.customerName, marginL + 4, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text(data.customerEmail, marginL + 4, y + 17);
  if (data.customerPhone) doc.text(data.customerPhone, marginL + 4, y + 21);

  const billingAddr = data.billingAddress;
  const billLine = [billingAddr.address || billingAddr.street, [billingAddr.city, billingAddr.state, billingAddr.zipCode || billingAddr.zip].filter(Boolean).join(', ')].filter(v => v && v !== 'N/A').join(', ');
  if (billLine) doc.text(billLine.slice(0, 55), marginL + 4, y + (data.customerPhone ? 26 : 22));

  // Ship To box
  doc.setFillColor(252, 252, 252);
  doc.roundedRect(addrCol2X, y, addrW, 32, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...FOREST);
  doc.text('SHIP TO', addrCol2X + 4, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  doc.text(data.customerName, addrCol2X + 4, y + 12);

  const shippingAddr = data.shippingAddress;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  const shipLine1 = shippingAddr.address || shippingAddr.street || '';
  const shipLine2 = [shippingAddr.city, shippingAddr.state, shippingAddr.zipCode || shippingAddr.zip].filter(v => v && v !== 'N/A').join(', ');
  if (shipLine1 && shipLine1 !== 'N/A') doc.text(shipLine1.slice(0, 55), addrCol2X + 4, y + 17);
  if (shipLine2) doc.text(shipLine2.slice(0, 55), addrCol2X + 4, y + 21);
  doc.text(shippingAddr.country || 'India', addrCol2X + 4, y + 25);

  // ─── ITEMS TABLE ─────────────────────────────────────────────────────
  const tableStartY = y + 38;

  // Build table body — items + totals in one table
  const itemRows = data.orderItems.map((item, idx) => [
    (idx + 1).toString(),
    item.productTitle,
    item.quantity.toString(),
    `Rs. ${item.price.toFixed(2)}`,
    `Rs. ${item.total.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [['#', 'Item', 'Qty', 'Unit Price', 'Amount']],
    body: itemRows,
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

  // ─── TOTALS — right-aligned summary box ───────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 50;
  const summaryX = pageW - marginR - 80;
  const summaryW = 80;
  let tY = finalY + 4;

  // Light background for totals
  const totalRows = [
    { label: 'Subtotal', value: `Rs. ${data.subtotal.toFixed(2)}` },
  ];
  if (data.productDiscount && data.productDiscount > 0) {
    totalRows.push({ label: 'Product Discount', value: `- Rs. ${data.productDiscount.toFixed(2)}` });
  }
  totalRows.push(
    { label: 'Convenience Fee', value: `Rs. ${data.tax.toFixed(2)}` },
    { label: 'Shipping', value: data.shipping === 0 ? 'FREE' : `Rs. ${data.shipping.toFixed(2)}` },
  );
  if (data.couponDiscount > 0) {
    totalRows.push({ label: data.couponCode ? `Coupon (${data.couponCode})` : 'Coupon', value: `- Rs. ${data.couponDiscount.toFixed(2)}` });
  }

  const totalsHeight = (totalRows.length * 5.5) + 12;
  doc.setFillColor(252, 252, 252);
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(summaryX, tY, summaryW, totalsHeight, 1.5, 1.5, 'FD');
  tY += 4;

  for (const row of totalRows) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const isDiscount = row.value.startsWith('-');
    doc.setTextColor(...(isDiscount ? FOREST : GRAY) as [number, number, number]);
    doc.text(row.label, summaryX + 4, tY);
    doc.setTextColor(...(isDiscount ? FOREST : DARK) as [number, number, number]);
    doc.text(row.value, summaryX + summaryW - 4, tY, { align: 'right' });
    tY += 5.5;
  }

  // Total row — green separator + bold
  doc.setDrawColor(...FOREST);
  doc.setLineWidth(0.5);
  doc.line(summaryX + 3, tY - 1, summaryX + summaryW - 3, tY - 1);
  tY += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...FOREST);
  doc.text('Total', summaryX + 4, tY);
  doc.text(`Rs. ${data.total.toFixed(2)}`, summaryX + summaryW - 4, tY, { align: 'right' });

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
  doc.text('For queries: concierge@kosvana.com | +91-7618362662 | kosvana.com', cx, pageH - 13, { align: 'center' });
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
                title: true,
                price: true
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
        originalPrice: item.product.price,
        total: item.quantity * item.price
      })),
      productDiscount: order.orderItems.reduce(
        (sum, item) => sum + ((item.product.price - item.price) * item.quantity), 0
      ),
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
