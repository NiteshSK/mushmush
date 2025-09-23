import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPromotionalBannersAPI() {
  try {
    console.log('🔍 Testing Promotional Banners API and Database...');

    // 1. Check database connection and count banners
    console.log('\n1. Checking database...');
    const bannerCount = await prisma.promotionalBanner.count();
    console.log(`📊 Total banners in database: ${bannerCount}`);

    if (bannerCount === 0) {
      console.log('❌ No banners found in database');
      return;
    }

    // 2. Get all banners from database
    const allBanners = await prisma.promotionalBanner.findMany({
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    console.log('\n📋 All banners in database:');
    allBanners.forEach((banner, index) => {
      console.log(`${index + 1}. ${banner.title}`);
      console.log(`   ID: ${banner.id}`);
      console.log(`   Priority: ${banner.priority}`);
      console.log(`   Active: ${banner.isActive}`);
      console.log(`   Start Date: ${banner.startDate}`);
      console.log(`   End Date: ${banner.endDate || 'No end date'}`);
      console.log(`   Image URL: ${banner.imageUrl}`);
      console.log('');
    });

    // 3. Test the API query logic (same as in the API endpoint)
    console.log('3. Testing API query logic...');
    const now = new Date();
    console.log(`📅 Current time: ${now}`);

    const activeBanners = await prisma.promotionalBanner.findMany({
      where: {
        isActive: true,
        startDate: {
          lte: now
        },
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            imgs: true,
            inStock: true
          }
        },
        category: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 5
    });

    console.log(`\n🎯 Active banners that would be returned by API: ${activeBanners.length}`);
    
    if (activeBanners.length === 0) {
      console.log('❌ No active banners found with current query logic');
      
      // Debug: Check why banners might not be active
      console.log('\n🔍 Debugging banner status...');
      allBanners.forEach((banner, index) => {
        const isActive = banner.isActive;
        const startDateValid = banner.startDate <= now;
        const endDateValid = !banner.endDate || banner.endDate >= now;
        const wouldBeActive = isActive && startDateValid && endDateValid;
        
        console.log(`${index + 1}. ${banner.title}`);
        console.log(`   isActive: ${isActive}`);
        console.log(`   startDate <= now: ${startDateValid} (${banner.startDate} <= ${now})`);
        console.log(`   endDate >= now or null: ${endDateValid} (${banner.endDate || 'null'} >= ${now})`);
        console.log(`   Would be active: ${wouldBeActive}`);
        console.log('');
      });
    } else {
      console.log('✅ Active banners found:');
      activeBanners.forEach((banner, index) => {
        console.log(`${index + 1}. ${banner.title} (Priority: ${banner.priority})`);
        console.log(`   Button: ${banner.buttonText} → ${banner.buttonLink}`);
        console.log(`   Discount: ${banner.discount || 'N/A'}`);
        console.log('');
      });
    }

    // 4. Check if images exist
    console.log('4. Checking image files...');
    const fs = require('fs');
    const path = require('path');
    
    activeBanners.forEach((banner) => {
      const imagePath = path.join(process.cwd(), 'public', banner.imageUrl);
      const imageExists = fs.existsSync(imagePath);
      console.log(`🖼️  ${banner.imageUrl}: ${imageExists ? '✅ Exists' : '❌ Missing'}`);
    });

    console.log('\n🚀 API test completed!');

  } catch (error) {
    console.error('❌ Error testing promotional banners:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  testPromotionalBannersAPI()
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

export { testPromotionalBannersAPI };
