import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedEarlyBirdBanners() {
  try {
    console.log('🌱 Seeding Early Bird Offer promotional banners...');

    // Clear existing early bird banners (optional - remove if you want to keep existing banners)
    await prisma.promotionalBanner.deleteMany({
      where: {
        title: {
          contains: 'Early Bird'
        }
      }
    });

    const earlyBirdBanners = [
      {
        title: 'Early Bird Offer - Oyster Mushroom Training',
        subtitle: 'Limited Time Special Price',
        description: 'Master Oyster Mushroom Cultivation at our special Early Bird price! Learn from experts and get hands-on experience with substrate preparation, spawning, and harvesting techniques.',
        discount: 'SAVE ₹1001',
        buttonText: 'Book Now - ₹3999',
        buttonLink: '/training',
        imageUrl: '/images/promo/oyster_promotion_banner.png',
        bgColor: '#F8FBF8', // Very light green, almost white
        textColor: '#2D5016',
        priority: 15, // Highest priority
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      {
        title: 'Early Bird Offer - Shiitake Mushroom Training',
        subtitle: 'Premium Training at Special Price',
        description: 'Advanced Shiitake Mushroom Cultivation training now available at Early Bird pricing! Learn log cultivation, bag cultivation, and specialized techniques for maximum yield.',
        discount: 'SAVE ₹1001',
        buttonText: 'Enroll Now - ₹6999',
        buttonLink: '/training',
        imageUrl: '/images/promo/shitake_promotion_banner.png',
        bgColor: '#F8FBF8', // Very light green, almost white
        textColor: '#E65100',
        priority: 14, // Second highest priority
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    ];

    console.log(`Creating ${earlyBirdBanners.length} Early Bird promotional banners...`);

    for (const banner of earlyBirdBanners) {
      const created = await prisma.promotionalBanner.create({
        data: banner,
      });
      
      console.log(`✅ Created Early Bird banner: ${created.title}`);
    }

    console.log(`\n🎉 Successfully created ${earlyBirdBanners.length} Early Bird promotional banners!`);
    
    // Display all active banners ordered by priority
    const activeBanners = await prisma.promotionalBanner.findMany({
      where: { isActive: true },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    console.log('\nAll active banners (ordered by priority):');
    activeBanners.forEach((banner, index) => {
      console.log(`${index + 1}. ${banner.title} (Priority: ${banner.priority}) - ${banner.discount}`);
    });

  } catch (error) {
    console.error('Error seeding Early Bird banners:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedEarlyBirdBanners()
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedEarlyBirdBanners };
