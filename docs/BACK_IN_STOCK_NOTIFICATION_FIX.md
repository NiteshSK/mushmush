# Back in Stock Email Notification Fix

## Problem Identified
Users were not receiving back in stock email notifications after products became available again. The root cause was that there was no automatic trigger to send restock notifications when a product's stock status changed from "out of stock" to "in stock".

## Root Cause Analysis
1. **Missing Trigger**: The admin product update endpoints (`PUT /api/admin/products/[id]` and `PATCH /api/admin/products/[id]`) were updating product stock status but not triggering the notification system.
2. **Complete System Present**: The notification system was fully implemented with:
   - `NotifyMeModal` component for user subscriptions
   - `/api/notifications` endpoint for managing subscriptions
   - `sendRestockNotifications()` function for sending emails
   - `ProductNotification` database model
   - Email templates and sending functionality

## Solution Implemented

### 1. Updated Admin Product Update Endpoints
**File**: `/src/app/api/admin/products/[id]/route.ts`

**Changes Made**:
- Added import for `sendRestockNotifications` function
- Added logic to detect when a product is coming back in stock (changing from `inStock: false` to `inStock: true`)
- Added automatic notification triggering after successful product updates

**PUT Endpoint Logic**:
```typescript
// Check if product is currently out of stock and will be updated to in stock
let shouldSendRestockNotifications = false;
if (inStock !== undefined && inStock === true) {
  const currentProduct = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    select: { inStock: true }
  });
  
  if (currentProduct && !currentProduct.inStock) {
    shouldSendRestockNotifications = true;
  }
}

// After updating product...
if (shouldSendRestockNotifications) {
  console.log(`Product ${id} came back in stock, sending notifications...`);
  sendRestockNotifications(parseInt(id)).catch((error) => {
    console.error('Failed to send restock notifications:', error);
  });
}
```

**PATCH Endpoint Logic**: Same logic applied to field-specific updates.

### 2. Created Test Script
**File**: `/scripts/test-restock-notifications.ts`

A comprehensive test script that:
- Lists all out-of-stock products and their subscribers
- Tests the notification system by temporarily setting a product to in stock
- Sends notifications and shows results
- Resets the product status for continued testing

## How the System Works

### User Flow:
1. **User Subscribes**: User clicks "Notify Me" on an out-of-stock product
2. **Email Confirmation**: User receives subscription confirmation email
3. **Admin Updates Stock**: Admin sets product to "in stock" via admin panel
4. **Automatic Notifications**: System automatically sends restock emails to all subscribers
5. **Notifications Deactivated**: Subscribers are marked as inactive after successful email delivery

### Technical Flow:
1. **Subscription**: `POST /api/notifications` creates/updates `ProductNotification` record
2. **Stock Update**: Admin updates product via `PUT/PATCH /api/admin/products/[id]`
3. **Detection**: System detects stock status change from `false` to `true`
4. **Notification**: `sendRestockNotifications()` fetches active subscribers and sends emails
5. **Cleanup**: Successful notifications are marked as inactive to prevent duplicates

## Testing the Fix

### Method 1: Using the Test Script
```bash
npx ts-node scripts/test-restock-notifications.ts
```

### Method 2: Manual Testing
1. **Set Product Out of Stock**:
   - Go to Admin panel
   - Find a product and set `inStock: false`

2. **Subscribe to Notifications**:
   - Visit the product page as a user
   - Click "Notify Me" and enter email
   - Check for subscription confirmation email

3. **Set Product In Stock**:
   - Go back to Admin panel
   - Set the same product to `inStock: true`

4. **Verify Notification**:
   - Check if restock email is received
   - Verify notification is marked as inactive in database

### Method 3: API Testing
```bash
# Subscribe to notifications
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "productId": 1}'

# Update product stock (as admin)
curl -X PUT http://localhost:3000/api/admin/products/1 \
  -H "Content-Type: application/json" \
  -d '{"inStock": true}'
```

## Email Templates

### Subscription Confirmation
- Subject: "You're subscribed for [Product Title] restock alerts"
- Content: Confirms subscription and provides product link

### Restock Alert
- Subject: "Good news! [Product Title] is back in stock!"
- Content: Notifies user that product is available with "Shop Now" button

## Environment Variables Required
Ensure these are set in your `.env.local` file:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
NEXTAUTH_URL=http://localhost:3000
```

## Database Schema
```sql
-- ProductNotification table stores subscriber information
CREATE TABLE product_notifications (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  product_id INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(email, product_id)
);
```

## Troubleshooting

### Common Issues:
1. **Emails Not Sending**: Check SMTP configuration and environment variables
2. **No Notifications Triggered**: Verify product actually changed from out-of-stock to in-stock
3. **Duplicate Emails**: Ensure notifications are marked as inactive after sending
4. **Admin Access Issues**: Verify user has ADMIN role

### Debug Commands:
```sql
-- Check active notifications
SELECT * FROM product_notifications WHERE is_active = true;

-- Check product stock status
SELECT id, title, in_stock FROM products;

-- Check email sending logs
-- Look for console logs: "Product X came back in stock, sending notifications..."
```

## Current Status
✅ **FIXED**: Back in stock email notifications now work automatically when admins update product stock status from out-of-stock to in-stock.

The system is now fully functional and ready for production use.
