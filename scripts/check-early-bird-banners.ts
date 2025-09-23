import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEarlyBirdBanners() {
  try {
    console.log('🔍 Checking for Early Bird promotional banners...');

    // Check for any Early Bird banners
    const earlyBirdBanners = await prisma.promotionalBanner.findMany({
      where: {
        title: {
          contains: 'Early Bird'
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    console.log(`\n📊 Found ${earlyBirdBanners.length} Early Bird banners:`);

    if (earlyBirdBanners.length === 0) {
      console.log('❌ No Early Bird banners found in the database.');
      console.log('💡 Run "npm run seed:early-bird-banners" to create them.');
    } else {
      earlyBirdBanners.forEach((banner, index) => {
        console.log(`\n${index + 1}. ${banner.title}`);
        console.log(`   Priority: ${banner.priority}`);
        console.log(`   Discount: ${banner.discount}`);
        console.log(`   Button: ${banner.buttonText}`);
        console.log(`   Link: ${banner.buttonLink}`);
        console.log(`   Active: ${banner.isActive}`);
        console.log(`   Start Date: ${banner.startDate}`);
        console.log(`   End Date: ${banner.endDate}`);
      });
    }

    // Also check all active banners
    const allActiveBanners = await prisma.promotionalBanner.findMany({
      where: { isActive: true },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    console.log(`\n🎯 Total active banners in database: ${allActiveBanners.length}`);
    allActiveBanners.forEach((banner, index) => {
      console.log(`${index + 1}. ${banner.title} (Priority: ${banner.priority})`);
    });

  } catch (error) {
    console.error('❌ Error checking Early Bird banners:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  checkEarlyBirdBanners()
    .catch((error) => {
      console.error('❌ Check failed:', error);
      process.exit(1);
    });
}

export { checkEarlyBirdBanners };
