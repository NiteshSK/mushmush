import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProductionPromotionalBanners() {
  try {
    console.log('🌱 Seeding production promotional banners...');

    // Get current date for production scheduling
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Clear existing promotional banners (optional - comment out if you want to keep existing)
    await prisma.promotionalBanner.deleteMany({});
    console.log('🗑️  Cleared existing promotional banners');

    const productionBanners = [
      // Early Bird Offers - High Priority
      {
        title: 'Early Bird Offer - Oyster Mushroom Training',
        subtitle: 'Limited Time Special Price',
        description: 'Master Oyster Mushroom Cultivation at our special Early Bird price! Learn from experts and get hands-on experience with substrate preparation, spawning, and harvesting techniques.',
        discount: 'SAVE ₹1001',
        buttonText: 'Book Now - ₹3999',
        buttonLink: '/training',
        imageUrl: '/images/promo/oyster_promotion_banner.png',
        bgColor: '#F8FBF8',
        textColor: '#2D5016',
        priority: 15, // Highest priority
        isActive: true,
        startDate: now,
        endDate: thirtyDaysFromNow
      },
      {
        title: 'Early Bird Offer - Shiitake Mushroom Training',
        subtitle: 'Premium Training at Special Price',
        description: 'Advanced Shiitake Mushroom Cultivation training now available at Early Bird pricing! Learn log cultivation, bag cultivation, and specialized techniques for maximum yield.',
        discount: 'SAVE ₹1001',
        buttonText: 'Enroll Now - ₹6999',
        buttonLink: '/training',
        imageUrl: '/images/promo/shitake_promotion_banner.png',
        bgColor: '#F8FBF8',
        textColor: '#E65100',
        priority: 14, // Second highest priority
        isActive: true,
        startDate: now,
        endDate: thirtyDaysFromNow
      }
    ];

    console.log(`Creating ${productionBanners.length} production promotional banners...`);

    const createdBanners = [];
    for (const banner of productionBanners) {
      const created = await prisma.promotionalBanner.create({
        data: banner,
      });
      
      createdBanners.push(created);
      console.log(`✅ Created banner: ${created.title} (Priority: ${created.priority})`);
    }

    console.log(`\n🎉 Successfully created ${createdBanners.length} production promotional banners!`);
    
    // Display summary of created banners
    console.log('\n📊 Production Banner Summary:');
    console.log('='.repeat(50));
    
    const activeBanners = await prisma.promotionalBanner.findMany({
      where: { isActive: true },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    console.log('\n🎯 Active Banners (ordered by priority):');
    activeBanners.forEach((banner, index) => {
      const endDate = banner.endDate ? banner.endDate.toLocaleDateString() : 'Ongoing';
      console.log(`${index + 1}. ${banner.title}`);
      console.log(`   Priority: ${banner.priority} | Discount: ${banner.discount || 'N/A'} | Ends: ${endDate}`);
      console.log(`   Button: ${banner.buttonText} → ${banner.buttonLink}`);
      console.log('');
    });

    // Validation checks
    console.log('🔍 Validation Checks:');
    console.log('-'.repeat(30));
    
    const highPriorityBanners = activeBanners.filter(b => b.priority >= 10);
    const mediumPriorityBanners = activeBanners.filter(b => b.priority >= 5 && b.priority < 10);
    const lowPriorityBanners = activeBanners.filter(b => b.priority < 5);
    
    console.log(`✅ High Priority Banners (10+): ${highPriorityBanners.length}`);
    console.log(`✅ Medium Priority Banners (5-9): ${mediumPriorityBanners.length}`);
    console.log(`✅ Low Priority Banners (1-4): ${lowPriorityBanners.length}`);
    
    const earlyBirdBanners = activeBanners.filter(b => b.title.includes('Early Bird'));
    console.log(`✅ Early Bird Banners: ${earlyBirdBanners.length}`);
    
    const activeNow = activeBanners.filter(b => 
      (!b.endDate || b.endDate > now) && b.startDate <= now
    );
    console.log(`✅ Currently Active Banners: ${activeNow.length}`);

    console.log('\n🚀 Production seeding completed successfully!');
    console.log('💡 Next steps:');
    console.log('   1. Verify banners appear correctly on the website');
    console.log('   2. Test banner links and functionality');
    console.log('   3. Monitor banner performance and engagement');
    console.log('   4. Update banner content as needed for seasonal campaigns');

  } catch (error) {
    console.error('❌ Error seeding production promotional banners:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedProductionPromotionalBanners()
    .catch((error) => {
      console.error('❌ Production seeding failed:', error);
      process.exit(1);
    });
}

export { seedProductionPromotionalBanners };
