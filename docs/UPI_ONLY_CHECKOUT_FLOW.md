# UPI-Only Checkout Flow with OTP Verification

## Overview
This document describes the architectural change to the checkout system, moving from a dual payment method (COD + UPI) to a UPI-only payment flow with OTP verification.

## New Checkout Flow

```
User clicks "Proceed to Checkout"
    ↓
OTP sent to email for verification
    ↓
User enters OTP
    ↓
Order created in database (status: CONFIRMED)
    ↓
UPI Payment Modal displayed with QR code
    ↓
User makes UPI payment
    ↓
User submits transaction ID
    ↓
Payment recorded (status: PENDING - awaiting admin verification)
    ↓
Order status updated to PROCESSING
    ↓
Cart cleared
    ↓
User redirected to Orders page
```

## Changes Made

### 1. Payment Method Component (`/src/components/Checkout/PaymentMethod.tsx`)
- **Changed default payment method** from `"cash"` to `"bank"` (UPI)
- **Disabled Cash on Delivery** option by wrapping it in a conditional `{false && (...)}` 
- **Code preserved** for future re-enablement - just change `false` to `true` to re-enable COD

### 2. UPI Payment Modal Component (`/src/components/Checkout/UPIPaymentModal.tsx`)
**New component created** for handling UPI payments in e-commerce checkout.

**Features:**
- Displays order details (order number, customer name, email, total amount)
- Shows company UPI ID with copy-to-clipboard functionality
- Generates UPI deep link for direct payment via UPI apps
- Displays QR code for easy scanning
- Form for entering transaction ID and optional payment screenshot
- Security notices and payment instructions

**Props:**
```typescript
interface UPIPaymentModalProps {
  orderData: {
    orderNumber: string;
    customerName: string;
    email: string;
    total: number;
  };
  onClose: () => void;
  onPaymentComplete: (paymentData: any) => void;
}
```

### 3. Checkout Component (`/src/components/Checkout/CheckoutWithOTP.tsx`)
**Major updates:**
- Changed default payment method to `"bank"` (UPI)
- Added UPI payment modal state management
- Updated `handleCheckout` to always send OTP (removed COD-specific logic)
- Modified `handleVerifyAndPlaceOrder` to:
  - Create order after OTP verification
  - Show UPI payment modal instead of immediately redirecting
- Added `handleUPIPaymentComplete` to handle successful payment submission
- Updated button text: "Verify & Continue to Payment"
- Removed COD-specific conditional messages

### 4. UPI Payment API (`/src/app/api/checkout/upi-payment/route.ts`)
**New API endpoint created** for processing UPI payments for e-commerce orders.

**Endpoint:** `POST /api/checkout/upi-payment`

**Request Body (FormData):**
- `orderNumber` (required): Order number
- `paymentMethod` (required): Should be "UPI"
- `upiTransactionId` (required): 12-digit UPI transaction ID
- `upiId` (optional): Customer's UPI ID
- `amount` (required): Payment amount
- `customerEmail` (required): Customer email
- `paymentProof` (optional): Payment screenshot file

**Validations:**
- Order must exist
- No duplicate payments for same order
- Amount must match order total
- Transaction ID must be unique

**Process:**
1. Validates order and payment details
2. Uploads payment proof (if provided) to `/public/payment-proofs/`
3. Creates payment record with status `PENDING` (requires admin verification)
4. Updates order status to `PROCESSING`
5. Returns success response

**Response:**
```json
{
  "success": true,
  "message": "Payment submitted successfully!...",
  "payment": {
    "id": "payment-id",
    "transactionId": "transaction-id",
    "status": "PENDING",
    "amount": 1234.56
  },
  "order": {
    "id": "order-id",
    "orderNumber": "ORD-123456",
    "status": "PROCESSING"
  }
}
```

### 5. Order Creation API (`/src/app/api/checkout/verify-and-place-order/route.ts`)
**No changes needed** - This API already handles order creation after OTP verification. Orders are created with status `CONFIRMED` and await payment submission.

## Database Schema

### Payment Table
The existing `Payment` model is used to store UPI payment details:
- `orderId`: Links to the order
- `amount`: Payment amount
- `paymentMethod`: "UPI"
- `transactionId`: UPI transaction ID
- `upiId`: Customer's UPI ID (optional)
- `status`: "PENDING" (awaiting admin verification)
- `paymentProof`: Path to uploaded screenshot
- `paidAt`: Payment submission timestamp

### Order Status Flow
1. **CONFIRMED**: Order created after OTP verification
2. **PROCESSING**: Payment submitted, awaiting admin verification
3. **SHIPPED**: Admin verified payment and shipped order
4. **DELIVERED**: Order delivered to customer
5. **COMPLETED**: Order completed (invoice generated)

## Admin Verification
Admins can verify UPI payments through the existing admin panel:
- View pending payments
- Check transaction IDs
- View payment proofs
- Approve or reject payments
- Update order status accordingly

## Security Features
1. **OTP Verification**: Email-based OTP before order creation
2. **Transaction ID Uniqueness**: Prevents duplicate payment submissions
3. **Amount Validation**: Ensures payment matches order total
4. **Admin Verification**: All UPI payments require admin approval before processing
5. **Payment Proof Upload**: Optional screenshot for faster verification

## Re-enabling Cash on Delivery

If you need to re-enable COD in the future:

1. **Update PaymentMethod.tsx:**
   ```typescript
   // Change this line:
   {false && (
   // To:
   {true && (
   ```

2. **Update CheckoutWithOTP.tsx:**
   - Change default payment method back to `"cash"` if desired
   - Add conditional logic to handle COD vs UPI flows
   - Update order creation to handle COD orders differently

3. **Update button text and messages** to reflect dual payment options

## Testing Checklist

- [ ] User can proceed to checkout with items in cart
- [ ] OTP is sent to email
- [ ] OTP verification works correctly
- [ ] Order is created after OTP verification
- [ ] UPI payment modal displays correctly
- [ ] QR code is scannable
- [ ] UPI deep link works on mobile
- [ ] Transaction ID submission works
- [ ] Payment proof upload works (optional)
- [ ] Payment is recorded with PENDING status
- [ ] Order status updates to PROCESSING
- [ ] Cart is cleared after payment submission
- [ ] User is redirected to orders page
- [ ] Admin can view and verify payments

## Company UPI Details

Current UPI ID configured in the system:
- **UPI ID**: `pravesh.rawat340-2@oksbi`
- **Name**: Pravesh Rawat

To update, modify the `companyUPI` object in:
- `/src/components/Checkout/UPIPaymentModal.tsx`
- `/src/components/Training/PaymentModal.tsx` (for training payments)

## File Structure

```
src/
├── components/
│   └── Checkout/
│       ├── CheckoutWithOTP.tsx (updated)
│       ├── PaymentMethod.tsx (updated)
│       └── UPIPaymentModal.tsx (new)
├── app/
│   └── api/
│       └── checkout/
│           ├── verify-and-place-order/
│           │   └── route.ts (existing)
│           └── upi-payment/
│               └── route.ts (new)
public/
└── payment-proofs/ (new directory)
    └── .gitkeep
```

## Notes

- Email confirmation for UPI payments is currently disabled (to be implemented with proper template)
- Payment proofs are stored in `/public/payment-proofs/` directory
- All UPI payments require admin verification before order processing
- The system maintains backward compatibility - COD code is preserved but disabled
