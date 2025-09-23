# Dynamic Early Bird Pricing Implementation

## Overview

This implementation adds dynamic Early Bird pricing functionality to the MushMush training programs. Instead of hardcoded pricing logic, the system now uses database-driven Early Bird offers with proper validation and display.

## Features

### Database Schema Updates
- Added new fields to `TrainingProgram` model:
  - `hasEarlyBirdOffer: Boolean` - Flag to enable/disable Early Bird pricing
  - `earlyBirdPrice: Float?` - Discounted price for Early Bird offer
  - `originalPrice: Float?` - Original price before discount
  - `earlyBirdEndDate: DateTime?` - End date for the Early Bird offer

### Dynamic Pricing Display
- Training component now reads Early Bird pricing directly from database
- Conditional display of Early Bird badges and pricing
- Automatic calculation of savings amount
- Strikethrough display of original prices

### Scripts and Tools

#### 1. Migration Script
- **File**: `prisma/migrations/20250919120000_add_early_bird_pricing/migration.sql`
- **Purpose**: Adds Early Bird pricing fields to the database schema
- **Usage**: Automatically applied during `prisma migrate dev`

#### 2. Data Population Script
- **File**: `scripts/add-early-bird-pricing.ts`
- **Purpose**: Populates existing training programs with Early Bird pricing data
- **Command**: `npm run add:early-bird-pricing`
- **Updates**:
  - Oyster Mushroom Training: ₹3,999 (was ₹3,000), Original: ₹5,000
  - Shiitake Mushroom Training: ₹6,999 (was ₹6,000), Original: ₹8,000
  - 30-day Early Bird period from current date

#### 3. Verification Script
- **File**: `scripts/verify-early-bird-pricing.ts`
- **Purpose**: Verifies Early Bird pricing configuration and API endpoint
- **Command**: `npm run verify:early-bird-pricing`
- **Checks**:
  - Database configuration
  - Price validation (Early Bird < Original)
  - Date validation (End Date in future)
  - API endpoint functionality

## Implementation Details

### 1. Schema Changes
```prisma
model TrainingProgram {
  // ... existing fields ...
  
  hasEarlyBirdOffer  Boolean   @default(false)
  earlyBirdPrice     Float?
  originalPrice      Float?
  earlyBirdEndDate   DateTime?
}
```

### 2. Component Updates
The Training component (`src/components/Training/index.tsx`) was updated to:
- Include Early Bird fields in the TypeScript interface
- Display Early Bird badge when `hasEarlyBirdOffer` is true
- Show strikethrough original price and discounted price
- Calculate and display savings amount
- Fallback to regular pricing when no Early Bird offer exists

### 3. API Integration
- The existing `/api/training-programs` endpoint automatically includes the new fields
- No changes needed to API code due to Prisma's automatic field inclusion
- Frontend component reads the new fields directly from API response

## Usage Instructions

### 1. Apply Database Migration
```bash
npm run db:migrate
```

### 2. Populate Early Bird Data
```bash
npm run add:early-bird-pricing
```

### 3. Verify Configuration
```bash
npm run verify:early-bird-pricing
```

### 4. Restart Development Server
```bash
npm run dev
```

## Current Early Bird Offers

| Program | Early Bird Price | Original Price | Savings | Duration |
|---------|------------------|----------------|---------|----------|
| Oyster Mushroom Training | ₹3,999 | ₹5,000 | ₹1,001 | 30 days |
| Shiitake Mushroom Training | ₹6,999 | ₹8,000 | ₹1,001 | 30 days |

## Future Enhancements

### 1. Admin Interface
- Add Early Bird pricing management to admin dashboard
- Allow admins to configure Early Bird offers for any program
- Set custom durations and pricing

### 2. Automatic Expiration
- Implement background job to automatically expire offers
- Send notifications when offers are about to expire
- Archive expired offers for reporting

### 3. Advanced Pricing Rules
- Support for percentage-based discounts
- Tiered pricing based on registration dates
- Dynamic pricing based on demand

### 4. Analytics and Reporting
- Track Early Bird offer conversion rates
- Report on revenue impact of Early Bird pricing
- A/B testing for different pricing strategies

## Troubleshooting

### Common Issues

1. **Early Bird pricing not displaying**
   - Run `npm run verify:early-bird-pricing` to check configuration
   - Ensure database migration was applied successfully
   - Restart the development server

2. **Incorrect pricing calculations**
   - Verify that `earlyBirdPrice` < `originalPrice`
   - Check that `hasEarlyBirdOffer` is set to `true`
   - Ensure dates are properly formatted

3. **API not returning Early Bird fields**
   - Run `prisma generate` to update Prisma client
   - Check that migration was applied to database
   - Verify API endpoint is functioning correctly

### Debug Commands

```bash
# Check database schema
npx prisma db pull

# Regenerate Prisma client
npm run db:generate

# View current training programs
npm run verify:early-bird-pricing

# Check API response
curl http://localhost:3000/api/training-programs
```

## Security Considerations

- All pricing data is validated before database storage
- Early Bird offers cannot be manipulated by frontend users
- Admin-only access to pricing configuration (when implemented)
- Proper error handling for missing or invalid data

## Performance Impact

- Minimal performance impact as fields are added to existing model
- No additional database queries required
- Frontend calculations are lightweight and client-side
- API response size increased slightly with new fields
