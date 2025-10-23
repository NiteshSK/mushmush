# Vercel Blob Invoice Storage Structure

## Overview

Invoice PDFs are stored in Vercel Blob Storage with a structured path format to optimize organization and reduce costs.

---

## Storage Path Structure

```
invoices/
  ├── {userId}/
  │   ├── {YYYY-MM-DD}/
  │   │   ├── INV-YYYYMMDD-XXXXX.pdf
  │   │   ├── INV-YYYYMMDD-YYYYY.pdf
  │   │   └── ...
  │   └── {YYYY-MM-DD}/
  │       └── ...
  ├── guest/
  │   ├── {YYYY-MM-DD}/
  │   │   └── INV-YYYYMMDD-ZZZZZ.pdf
  │   └── ...
```

### Path Format

**Pattern:** `invoices/{userId}/{YYYY-MM-DD}/{invoiceNumber}.pdf`

**Components:**
- **`invoices/`** - Root folder for all invoices
- **`{userId}`** - User ID from the order (or "guest" for non-authenticated users)
- **`{YYYY-MM-DD}`** - Date folder in ISO format (e.g., "2025-10-23")
- **`{invoiceNumber}.pdf`** - Invoice file (e.g., "INV-20251023-ABC12.pdf")

### Examples

```
invoices/user_abc123/2025-10-23/INV-20251023-XYZ45.pdf
invoices/user_def456/2025-10-23/INV-20251023-QWE78.pdf
invoices/guest/2025-10-22/INV-20251022-RTY90.pdf
```

---

## Benefits

### 1. **Cost Optimization**
- **Organized Storage**: Files are grouped by user and date, making it easier to manage and clean up old files
- **Efficient Queries**: Structured paths allow for targeted file operations
- **Reduced Operations**: Fewer API calls needed to locate specific invoices

### 2. **Better Organization**
- **User Isolation**: Each user's invoices are in their own folder
- **Date-based Archival**: Easy to archive or delete invoices by date
- **Scalability**: Structure scales well with growing number of users and invoices

### 3. **Improved Performance**
- **Faster Lookups**: Hierarchical structure enables faster file retrieval
- **Reduced Listing Overhead**: Don't need to list all invoices to find one
- **Better Caching**: CDN can cache user-specific folders more effectively

### 4. **Compliance & Privacy**
- **User Data Isolation**: Easy to delete all invoices for a specific user (GDPR compliance)
- **Audit Trail**: Date folders provide clear chronological organization
- **Access Control**: Can implement user-specific access policies

---

## Implementation

### Invoice Generation Function

```typescript
export async function generateInvoicePDF(data: InvoiceData, userId?: string): Promise<string> {
  // ... PDF generation code ...
  
  // Create structured path
  const date = new Date();
  const dateFolder = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const userFolder = userId || 'guest';
  const blobPath = `invoices/${userFolder}/${dateFolder}/${invoiceNumber}.pdf`;
  
  // Upload to Vercel Blob
  const blob = await put(blobPath, pdfBuffer, {
    access: 'public',
    contentType: 'application/pdf',
  });
  
  return blob.url;
}
```

### Usage in Order Flow

```typescript
// In generateInvoice function
const blobUrl = await generateInvoicePDF(invoiceData, order.userId || undefined);
```

---

## File Naming Convention

### Invoice Number Format

**Pattern:** `INV-YYYYMMDD-XXXXX`

**Components:**
- **`INV`** - Prefix indicating invoice
- **`YYYYMMDD`** - Date (e.g., "20251023")
- **`XXXXX`** - Random 5-character alphanumeric code (uppercase)

**Example:** `INV-20251023-A7B2C`

### Generation Logic

```typescript
export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `INV-${year}${month}${day}-${random}`;
}
```

---

## Database Schema

### Invoice Model

```prisma
model Invoice {
  id              String        @id @default(cuid())
  invoiceNumber   String        @unique
  status          InvoiceStatus @default(DRAFT)
  issuedAt        DateTime      @default(now())
  dueAt           DateTime?
  orderId         String        @unique
  pdfPath         String?       // Vercel Blob URL
  customerName    String?
  customerEmail   String?
  customerPhone   String?
  // ... other fields
  
  order           Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  @@map("invoices")
}
```

**`pdfPath` field stores the full Vercel Blob URL:**
```
https://xxxxx.public.blob.vercel-storage.com/invoices/user_abc123/2025-10-23/INV-20251023-XYZ45.pdf
```

---

## Cost Comparison

### Before (Flat Structure)

```
invoices/
  ├── INV-20251023-ABC12.pdf
  ├── INV-20251023-DEF34.pdf
  ├── INV-20251023-GHI56.pdf
  └── ... (thousands of files)
```

**Issues:**
- ❌ Listing all files to find one invoice
- ❌ No organization by user or date
- ❌ Difficult to clean up old files
- ❌ Higher API call costs

### After (Structured Paths)

```
invoices/
  ├── user_abc123/
  │   └── 2025-10-23/
  │       └── INV-20251023-ABC12.pdf
  ├── user_def456/
  │   └── 2025-10-23/
  │       └── INV-20251023-DEF34.pdf
```

**Benefits:**
- ✅ Direct path to user's invoices
- ✅ Organized by date for easy archival
- ✅ Reduced API calls
- ✅ Lower storage costs

---

## Maintenance Operations

### Archive Old Invoices

```typescript
// Archive invoices older than 1 year
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
const archiveDate = oneYearAgo.toISOString().split('T')[0];

// Can target specific date folders for archival
// invoices/{userId}/{dates-before-archiveDate}/
```

### Delete User Data (GDPR)

```typescript
// Delete all invoices for a specific user
const userInvoicePath = `invoices/${userId}/`;

// Can delete entire user folder
// This is much more efficient than finding and deleting individual files
```

### Monthly Cleanup

```typescript
// Clean up guest invoices older than 30 days
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const cleanupDate = thirtyDaysAgo.toISOString().split('T')[0];

// Target: invoices/guest/{dates-before-cleanupDate}/
```

---

## Environment Variables

### Required

```env
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxxxxxxxxxx
```

### Configuration

Vercel Blob is automatically configured when you deploy to Vercel. No additional setup needed.

---

## Access Control

### Public Access

Invoices are set to `public` access, meaning anyone with the URL can download them.

```typescript
const blob = await put(blobPath, pdfBuffer, {
  access: 'public',  // Public access
  contentType: 'application/pdf',
});
```

### Security Considerations

1. **URL Obfuscation**: Vercel Blob URLs are long and random, making them hard to guess
2. **User Verification**: API endpoints verify user ownership before returning invoice URLs
3. **No Directory Listing**: Users cannot list all files in a folder
4. **HTTPS Only**: All URLs use HTTPS for secure transmission

### API Protection

```typescript
// GET /api/orders/[id]/invoice
if (session.user.role !== 'ADMIN') {
  const orderUserId = invoice.order?.userId;
  if (orderUserId !== session.user.id) {
    return NextResponse.json(
      { error: 'Unauthorized to access this invoice' },
      { status: 403 }
    );
  }
}
```

---

## Monitoring & Analytics

### Storage Metrics

Track storage usage by:
- **User**: `invoices/{userId}/` folder size
- **Date**: `invoices/*/{YYYY-MM-DD}/` folder size
- **Total**: All invoices combined

### Cost Optimization Tips

1. **Regular Cleanup**: Delete old guest invoices (>30 days)
2. **Archive Old Invoices**: Move invoices >1 year to cheaper storage
3. **Compress PDFs**: Use PDF compression to reduce file sizes
4. **Monitor Growth**: Track storage growth by user and date

---

## Migration from Old Structure

If you have existing invoices in a flat structure:

```typescript
// Migration script (example)
async function migrateInvoices() {
  const invoices = await prisma.invoice.findMany({
    include: { order: true }
  });
  
  for (const invoice of invoices) {
    // Download old PDF
    const oldUrl = invoice.pdfPath;
    const response = await fetch(oldUrl);
    const pdfBuffer = await response.arrayBuffer();
    
    // Upload to new structured path
    const date = new Date(invoice.createdAt);
    const dateFolder = date.toISOString().split('T')[0];
    const userFolder = invoice.order.userId || 'guest';
    const newPath = `invoices/${userFolder}/${dateFolder}/${invoice.invoiceNumber}.pdf`;
    
    const blob = await put(newPath, Buffer.from(pdfBuffer), {
      access: 'public',
      contentType: 'application/pdf',
    });
    
    // Update database
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { pdfPath: blob.url }
    });
    
    // Delete old file (optional)
    // await del(oldUrl);
  }
}
```

---

## Summary

✅ **Structured Storage**: `invoices/{userId}/{YYYY-MM-DD}/{invoiceNumber}.pdf`
✅ **Cost Efficient**: Reduced API calls and better organization
✅ **Scalable**: Grows efficiently with user base
✅ **Maintainable**: Easy to archive, clean up, and manage
✅ **Compliant**: GDPR-friendly user data isolation
✅ **Secure**: User verification before access

This structure provides a solid foundation for managing invoice storage at scale while minimizing costs and maximizing efficiency.
