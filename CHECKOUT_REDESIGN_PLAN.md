# Checkout Address System Redesign

## Current Issues
1. ❌ Multiple address components showing duplicate addresses
2. ❌ Billing address asked every time during checkout
3. ❌ No checkbox to use billing address as shipping address
4. ❌ Complex logic with multiple address selectors (BillingNew, ShippingNew, AddressSelector)
5. ❌ Confusing user experience with repeated address forms

## Requirements
1. ✅ Show saved addresses without duplicates
2. ✅ If user has saved addresses, use them by default
3. ✅ Checkbox to change billing address (only if user wants to)
4. ✅ Billing address asked only once (first order) - saved automatically
5. ✅ Checkbox to make shipping address same as billing address
6. ✅ Clean, intuitive user flow

## Implementation Plan

### 1. Database Schema (Already Exists)
- `addresses` table with fields: id, street, city, state, zip, country, type, isDefault, userId
- Supports up to 5 addresses per user
- Has BILLING, SHIPPING, BOTH types

### 2. New Checkout Flow

#### For First-Time Users (No Saved Addresses)
1. Show Contact Information form
2. Show Billing Address form (will be saved automatically)
3. Show checkbox: "Ship to billing address" (checked by default)
4. If unchecked, show Shipping Address form

#### For Returning Users (Has Saved Addresses)
1. Show Contact Information (pre-filled)
2. Show Billing Address section:
   - Display selected saved address (default or first)
   - Show checkbox: "Change billing address"
   - If checked, show all saved addresses to select or enter new
3. Show Shipping Address section:
   - Checkbox: "Ship to billing address" (checked by default)
   - If unchecked, show saved addresses or new address form

### 3. Component Structure
```
CheckoutWithOTP (Main Component)
├── Contact Information Section
├── Billing Address Section
│   ├── Saved Address Display (if available)
│   ├── Change Billing Checkbox
│   └── Address Selection/Form (if changing)
├── Shipping Address Section
│   ├── Same as Billing Checkbox
│   └── Address Selection/Form (if different)
├── Order Notes
└── Order Summary + Payment
```

### 4. State Management
```typescript
// Address state
savedAddresses: Address[]
selectedBillingId: string
selectedShippingId: string
useNewBilling: boolean
useNewShipping: boolean
sameAsBilling: boolean (default: true)
changeBillingAddress: boolean (default: false)

// Contact state
contactInfo: { firstName, lastName, email, phone }
```

### 5. User Flow Logic

**Scenario 1: First-time user**
- No saved addresses
- Must fill billing address (will be saved)
- Can choose to use same for shipping or enter different

**Scenario 2: Returning user - same addresses**
- Has saved addresses
- Default address auto-selected for billing
- "Ship to billing address" checked by default
- One-click checkout

**Scenario 3: Returning user - change billing**
- Clicks "Change billing address" checkbox
- Shows all saved addresses + option for new
- Can select different saved address or enter new

**Scenario 4: Returning user - different shipping**
- Unchecks "Ship to billing address"
- Shows all saved addresses + option for new
- Can select different saved address or enter new

### 6. API Integration
- GET /api/addresses - Fetch user's saved addresses
- POST /api/addresses - Save new address (automatic for first-time users)
- POST /api/checkout/send-otp - Send OTP for order verification
- POST /api/checkout/verify-and-place-order - Verify OTP and create order

### 7. Validation Rules
- Contact info: All fields required
- Billing address: Required (saved or new)
- Shipping address: Required if different from billing
- Phone: 10-digit Indian mobile number
- PIN code: 6-digit number
- Email: Valid email format

### 8. Testing Scenarios
1. ✅ First-time user checkout with same billing/shipping
2. ✅ First-time user checkout with different billing/shipping
3. ✅ Returning user with default address (one-click)
4. ✅ Returning user changing billing address
5. ✅ Returning user with different shipping address
6. ✅ Guest checkout (no account)
7. ✅ Address validation (PIN code, phone format)
8. ✅ OTP verification flow
9. ✅ Address saving after first order
10. ✅ Multiple saved addresses selection

## Benefits
1. 🎯 Simplified user experience
2. 🎯 Reduced form fields for returning users
3. 🎯 Clear, intuitive flow
4. 🎯 No duplicate address displays
5. 🎯 Faster checkout for repeat customers
6. 🎯 Better conversion rates
