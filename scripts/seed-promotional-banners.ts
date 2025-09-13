import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPromotionalBanners() {
  try {
    // Clear existing promotional banners
    await prisma.promotionalBanner.deleteMany();

    // Get some products to link to banners
    const products = await prisma.product.findMany({
      take: 3,
      select: { id: true, title: true }
    });

    // Get some categories to link to banners
    const categories = await prisma.category.findMany({
      take: 2,
      select: { id: true, title: true }
    });

    const banners = [
      {
        title: 'Ganoderma Tinctures Special',
        subtitle: 'Premium Wellness Collection',
        description: 'Experience the wellness benefits of our premium Ganoderma extracts with natural healing properties.',
        discount: 'UP TO 15% OFF',
        buttonText: 'Shop Now',
        productId: products[0]?.id || null,
        imageUrl: '/images/promo/ganoderma_tinctures.png',
        bgColor: '#F5F5F7',
        textColor: '#000000',
        priority: 10,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      {
        title: 'Mushroom Supplements Sale',
        subtitle: 'Health & Immunity Boost',
        description: 'Boost your immune system with our organic mushroom supplements. Natural, pure, and effective.',
        discount: 'SAVE 20%',
        buttonText: 'Explore Collection',
        categoryId: categories[0]?.id || null,
        imageUrl: '/images/promo/mushroom_supplements.png',
        bgColor: '#E8F5E8',
        textColor: '#2D5016',
        priority: 8,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      },
      {
        title: 'New Arrivals',
        subtitle: 'Fresh Mushroom Products',
        description: 'Discover our latest collection of premium mushroom-based wellness products.',
        discount: 'NEW LAUNCH',
        buttonText: 'Discover Now',
        productId: products[1]?.id || null,
        imageUrl: '/images/promo/new_arrivals.png',
        bgColor: '#FFF3E0',
        textColor: '#E65100',
        priority: 6,
        isActive: true,
        startDate: new Date(),
        endDate: null // No end date
      },
      {
        title: 'Organic Mushroom Bundle',
        subtitle: 'Complete Wellness Package',
        description: 'Get everything you need for optimal health with our curated mushroom bundle.',
        discount: '25% OFF BUNDLE',
        buttonText: 'Get Bundle',
        categoryId: categories[1]?.id || null,
        imageUrl: '/images/promo/mushroom_bundle.png',
        bgColor: '#F3E5F5',
        textColor: '#4A148C',
        priority: 7,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        title: 'Limited Time Offer',
        subtitle: 'Flash Sale',
        description: 'Don\'t miss out on this incredible deal on our bestselling products.',
        discount: 'FLASH SALE 30% OFF',
        buttonText: 'Shop Flash Sale',
        buttonLink: '/shop?sale=true',
        imageUrl: '/images/promo/flash_sale.png',
        bgColor: '#FFEBEE',
        textColor: '#C62828',
        priority: 9,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      }
    ];

    console.log('Creating promotional banners...');

    for (const banner of banners) {
      const created = await prisma.promotionalBanner.create({
        data: banner,
        include: {
          product: {
            select: { title: true }
          },
          category: {
            select: { title: true }
          }
        }
      });
      
      console.log(`✅ Created banner: ${created.title}${created.product ? ` (linked to product: ${created.product.title})` : ''}${created.category ? ` (linked to category: ${created.category.title})` : ''}`);
    }

    console.log(`\n🎉 Successfully created ${banners.length} promotional banners!`);
    console.log('\nBanners are ordered by priority (highest first):');
    
    const activeBanners = await prisma.promotionalBanner.findMany({
      where: { isActive: true },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        product: { select: { title: true } },
        category: { select: { title: true } }
      }
    });

    activeBanners.forEach((banner, index) => {
      console.log(`${index + 1}. ${banner.title} (Priority: ${banner.priority})`);
    });

  } catch (error) {
    console.error('Error seeding promotional banners:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPromotionalBanners();
