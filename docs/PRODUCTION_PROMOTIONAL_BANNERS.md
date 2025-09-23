# Production Promotional Banners

This document describes the production promotional banners system for MushMush website, including setup, usage, and management.

## Overview

The production promotional banners system is designed to display dynamic, priority-based promotional content on the website homepage. Banners are automatically rotated and ordered by priority, with the highest priority banners appearing first.

## Features

- **Priority-based ordering**: Higher priority numbers appear first
- **Automatic rotation**: Banners rotate every 5 seconds
- **Date-based scheduling**: Banners can be scheduled with start and end dates
- **Multiple banner types**: Early Bird offers, general promotions, seasonal offers, and educational content
- **Responsive design**: Banners work on all device sizes
- **Database-driven**: All banner content is managed through the database

## Banner Categories

### Early Bird Offers (Priority 14-15)
- **Oyster Mushroom Training**: ₹3999 (Early Bird) - SAVE ₹1001
- **Shiitake Mushroom Training**: ₹6999 (Early Bird) - SAVE ₹1001

## Setup Instructions

### 1. Database Schema

The promotional banners use the following database schema:

```sql
model PromotionalBanner {
  id          Int      @id @default(autoincrement())
  title       String
  subtitle    String?
  description String?
  discount    String?  // e.g., "UP TO 10% OFF", "50% OFF", etc.
  buttonText  String   @default("Buy Now")
  buttonLink  String?  // Can be product URL, category URL, or external link
  productId   Int?     // Optional: link to specific product
  categoryId  Int?     // Optional: link to specific category
  imageUrl    String
  bgColor     String   @default("#F5F5F7")
  textColor   String   @default("#000000")
  isActive    Boolean  @default(true)
  startDate   DateTime @default(now())
  endDate     DateTime?
  priority    Int      @default(0) // Higher number = higher priority
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  product     Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
}
```

### 2. Running the Production Seed

To populate the database with production promotional banners:

```bash
# Run the production seed script
npm run seed:production-banners
```

This will:
- Clear existing promotional banners (optional - can be commented out)
- Create 2 production-ready banners with proper priorities
- Set up scheduling with appropriate start and end dates
- Provide validation and summary reports

### 3. Manual Banner Management

You can also manage banners through the admin portal or directly via database operations:

#### Creating a Banner

```typescript
const banner = await prisma.promotionalBanner.create({
  data: {
    title: "Your Banner Title",
    subtitle: "Subtitle",
    description: "Detailed description",
    discount: "50% OFF",
    buttonText: "Shop Now",
    buttonLink: "/products",
    imageUrl: "/images/promo/your-banner.png",
    bgColor: "#F8FBF8",
    textColor: "#2D5016",
    priority: 10,
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
});
```

#### Updating a Banner

```typescript
const updatedBanner = await prisma.promotionalBanner.update({
  where: { id: bannerId },
  data: {
    priority: 15,
    isActive: true,
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // Extend to 60 days
  }
});
```

## Banner Display Logic

### Priority System

- **Priority 15**: Highest priority (Oyster Mushroom Training)
- **Priority 14**: High priority (Shiitake Mushroom Training)

### Rotation Rules

1. Banners are ordered by priority (highest first)
2. Within the same priority, banners are ordered by creation date (newest first)
3. Only active banners with current dates are displayed
4. Banners automatically rotate every 5 seconds

### Date Validation

- `startDate`: When the banner becomes active
- `endDate`: When the banner expires (optional)
- Banners are only displayed if:
  - `isActive` is true
  - Current date is >= `startDate`
  - Current date is <= `endDate` (if specified)

## Image Requirements

Banner images should be placed in `/public/images/promo/` directory with the following specifications:

- **Recommended size**: 1200x400 pixels
- **Format**: PNG or JPG
- **File size**: Under 200KB
- **Naming convention**: descriptive names with underscores (e.g., `oyster_promotion_banner.png`)

### Required Images for Production

The following images are referenced in the production seed:

1. `/images/promo/oyster_promotion_banner.png`
2. `/images/promo/shitake_promotion_banner.png`

## Color Scheme

The production banners use a carefully selected color scheme:

### Early Bird Offers
- **Background**: `#F8FBF8` (Very light green)
- **Text**: `#2D5016` (Dark green) or `#E65100` (Orange)

## Testing and Validation

### Running Tests

```bash
# Test banner functionality
npm run check:early-bird-banners

# Verify Early Bird pricing integration
npm run verify:early-bird-pricing

# Test admin functionality
npm run test:admin-early-bird
```

### Manual Testing Checklist

1. **Banner Display**
   - [ ] Banners appear on homepage
   - [ ] Banners rotate every 5 seconds
   - [ ] Priority ordering is correct
   - [ ] Only active banners are shown

2. **Banner Content**
   - [ ] Images load correctly
   - [ ] Text is readable and properly formatted
   - [ ] Buttons work and link to correct pages
   - [ ] Color schemes are consistent

3. **Date Scheduling**
   - [ ] Banners respect start/end dates
   - [ ] Expired banners are not displayed
   - [ ] Future banners are not displayed prematurely

4. **Responsive Design**
   - [ ] Banners work on mobile devices
   - [ ] Banners work on tablets
   - [ ] Banners work on desktop

## Production Deployment

### Pre-Deployment Checklist

1. [ ] Run `npm run seed:production-banners` to populate banners
2. [ ] Verify all banner images exist in `/public/images/promo/`
3. [ ] Test all banner links and functionality
4. [ ] Run validation tests
5. [ ] Check database connection and permissions

### Deployment Commands

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed production banners
npm run seed:production-banners

# Build the application
npm run build

# Start the application
npm start
```

## Monitoring and Maintenance

### Regular Maintenance Tasks

1. **Weekly**
   - Check banner performance and engagement
   - Update expiring banners
   - Review priority ordering

2. **Monthly**
   - Add new seasonal banners
   - Remove expired banners
   - Update banner images and content

3. **Quarterly**
   - Review overall banner strategy
   - Analyze conversion rates
   - Plan upcoming promotions

### Performance Monitoring

Monitor the following metrics:
- Banner click-through rates
- Conversion rates from banner clicks
- Banner view counts
- User engagement time

### Troubleshooting

#### Common Issues

1. **Banners not appearing**
   - Check database connection
   - Verify banners are active
   - Check date scheduling
   - Review priority values

2. **Images not loading**
   - Verify image paths
   - Check file permissions
   - Ensure images exist in correct directory

3. **Links not working**
   - Verify URL paths
   - Check routing configuration
   - Test target pages exist

#### Debug Commands

```bash
# Check database connection
npm run db:studio

# View all banners
npx tsx scripts/view-banners.ts

# Test banner API endpoints
npm run api:check:production
```

## Future Enhancements

### Planned Features

1. **A/B Testing**
   - Multiple banner variants
   - Performance comparison
   - Automatic optimization

2. **Advanced Scheduling**
   - Time-based scheduling
   - User segmentation
   - Geographic targeting

3. **Analytics Integration**
   - Click tracking
   - Conversion tracking
   - Performance dashboards

4. **Admin Interface**
   - Drag-and-drop priority management
   - Image upload interface
   - Real-time preview

## Support

For issues or questions regarding the promotional banners system:

1. Check this documentation
2. Review existing troubleshooting guides
3. Contact the development team
4. Check the project's issue tracker

---

**Last Updated**: September 23, 2025
**Version**: 1.0.0
