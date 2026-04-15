# Chatbot Commerce System

## Overview

The Kosvana chatbot is a full-featured shopping assistant that supports product browsing, wishlisting, checkout, and UPI payment — all within the chat window. It uses the same backend APIs and data as the main website.

## Architecture

```
┌─────────────────────────────────────────┐
│              ChatBot.tsx                 │
│  ┌─────┐  ┌──────┐  ┌──────────┐       │
│  │Chat │  │ Shop │  │ Wishlist │  Tabs  │
│  └──┬──┘  └──┬───┘  └────┬─────┘       │
│     │        │            │             │
│  AI Chat  Product Grid  Wishlist Items  │
│  + Inline  + Search     + Buy buttons   │
│  Products  + Buy        (same DB list)  │
│     │        │            │             │
│     └────────┴────────────┘             │
│              │                          │
│     ┌────────┴────────┐                 │
│     │  ChatCheckout   │                 │
│     │  Details → OTP  │                 │
│     └────────┬────────┘                 │
│     ┌────────┴────────┐                 │
│     │  ChatPayment    │                 │
│     │  UPI QR + TXN   │                 │
│     └─────────────────┘                 │
└─────────────────────────────────────────┘
```

## Components

| Component | File | Purpose |
|-----------|------|---------|
| ChatBot | `src/components/AI/ChatBot.tsx` | Main container: tabs, views, state management |
| ChatProductCard | `src/components/AI/ChatProductCard.tsx` | Product card with Buy + Wishlist heart |
| ChatCheckout | `src/components/AI/ChatCheckout.tsx` | Checkout form: details, shipping, OTP |
| ChatPayment | `src/components/AI/ChatPayment.tsx` | UPI QR code + transaction ID submission |
| ChatAuth (unused) | `src/components/AI/ChatAuth.tsx` | In-chat auth (replaced by redirect to `/auth/signin`) |

## Views / Tabs

### Chat Tab
- AI conversation powered by Google Gemini 2.5 Flash via AI SDK v5
- **Inline product cards**: AI calls `searchProducts` tool → product cards with Buy buttons render inside the chat
- Quick-action chips on welcome screen (Mushrooms, Dry Fruits, Seeds, Training, etc.)
- Markdown rendering with special handling for WhatsApp/Email/Phone links

### Shop Tab
- Fetches products from `/api/products` (default) or `/api/products/search?q=X` (when searching)
- Product cards with Buy button + Wishlist heart
- Search bar with clear button

### Wishlist Tab
- Shows items from `WishlistContext` (same DB-backed wishlist as the main site)
- Product cards with Buy button
- Item count badge on tab
- Empty state with "Browse Shop" link
- Not-logged-in state with "Sign In" link

## Purchase Flow

### 1. Authentication gate
When an unauthenticated user taps **Buy**:
1. Product saved to `localStorage` (`chatbot_pending_product`)
2. Chatbox closes
3. Toast: "Please sign in to complete your purchase. Redirecting..."
4. After 800ms → redirect to `/auth/signin?callbackUrl=...`
5. After sign-in → user returns, chatbox auto-opens at checkout
6. Toast: "Welcome back! Continue your purchase."

### 2. Checkout (ChatCheckout)
- Pre-fills name/email from session
- Customer details: name, email, phone, address (street, city, state, pincode)
- **Pincode-based shipping** via `/api/shipping/check` (same as main checkout)
  - Shows delivery status, estimated days, free-shipping threshold
  - Blocks checkout if pincode not deliverable
  - Re-checks when quantity changes
- Price breakdown: Subtotal → Product Discount → Shipping → Convenience → Total
- Stock quantity enforced: (+) button disabled at max, "Only X left" warning
- OTP verification via `/api/checkout/send-otp`
- Order placed via `/api/checkout/verify-and-place-order`

### 3. Payment (ChatPayment)
- UPI QR code generated from `generateUPILink()` (same config as main checkout)
- Copy UPI ID button
- "Open UPI App" deep link (mobile)
- Transaction ID input + optional screenshot upload
- Submits to `/api/checkout/upi-payment`
- Success screen with confirmation

## AI Chat: searchProducts Tool

**File:** `src/app/api/ai-chat/route.ts`

The AI has a `searchProducts` tool that queries the database for products:

```typescript
tools: {
  searchProducts: {
    description: "Search and display product cards in the chat",
    inputSchema: z.object({ query: z.string() }),
    execute: async ({ query }) => {
      // Searches products by title/description keywords
      // Falls back to featured products if no matches
      // Returns up to 8 products with full pricing data
    },
  },
},
stopWhen: stepCountIs(3),  // Allows tool call → result → follow-up text
```

**Frontend rendering** (AI SDK v5 format):
- Tool parts have type `tool-searchProducts` and state `output-available`
- Products rendered as `ChatProductCard` components with Buy buttons
- "Browse all products in Shop →" button appears below cards
- Loading spinner shown during tool execution

## Shared Infrastructure

The chatbot reuses existing infrastructure — **no separate backend**:

| Feature | Shared With | API/Context |
|---------|-------------|-------------|
| Products | Shop page | `/api/products`, `/api/products/search` |
| Wishlist | Wishlist page, Product cards | `WishlistContext` → `/api/wishlist` |
| Shipping | Checkout page | `/api/shipping/check` |
| OTP | Checkout page | `/api/checkout/send-otp` |
| Orders | Checkout page | `/api/checkout/verify-and-place-order` |
| Payments | Checkout page | `/api/checkout/upi-payment` |
| Auth | Signin/Signup pages | NextAuth session, `/auth/signin` redirect |
| Stock limits | Cart, Product details | `stockQuantity` from products API |

## Stock Quantity Enforcement

Stock limits are enforced at every layer:

| Layer | Component | How |
|-------|-----------|-----|
| UI | ChatCheckout (+) button | `quantity < stockQuantity` check, disabled at max |
| UI | ChatProductCard | Shows "Only X left" via the checkout |
| UI | Cart SingleItem | Same stock check + "Only X left in stock" |
| Redux | `updateCartItemQuantity` | Caps at `stockQuantity`, min 1 |
| Redux | `addItemToCart` | Caps initial + cumulative quantity |
| API | `verify-and-place-order` | Server-side `availablePacks()` validation |
| API | `upi-payment` | Atomic `decrementStockAtomic()` with SQL WHERE guard |

## Tests

```bash
# All chatbot component tests (81 tests, 5 suites)
npx jest src/components/AI/__tests__/

# Individual suites
npx jest src/components/AI/__tests__/ChatBot.test.tsx        # 18 tests
npx jest src/components/AI/__tests__/ChatCheckout.test.tsx    # 21 tests
npx jest src/components/AI/__tests__/ChatPayment.test.tsx     # 14 tests
npx jest src/components/AI/__tests__/ChatProductCard.test.tsx # 8 tests
npx jest src/components/AI/__tests__/ChatAuth.test.tsx        # 20 tests

# Stock guardrail tests
npx jest src/redux/features/__tests__/cart-slice.test.ts      # 18 tests
```

## Key Files

```
src/components/AI/
├── ChatBot.tsx              # Main container with tabs + view management
├── ChatProductCard.tsx      # Product card (Buy + Wishlist heart)
├── ChatCheckout.tsx         # Checkout flow (details → OTP → order)
├── ChatPayment.tsx          # UPI payment (QR → transaction ID → confirm)
├── ChatAuth.tsx             # In-chat auth (legacy, replaced by redirect)
└── __tests__/
    ├── ChatBot.test.tsx
    ├── ChatCheckout.test.tsx
    ├── ChatPayment.test.tsx
    ├── ChatProductCard.test.tsx
    └── ChatAuth.test.tsx

src/app/api/ai-chat/route.ts  # AI chat API with searchProducts tool
```
