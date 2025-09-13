import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTables() {
  try {
    // Check if promotional_banners table exists
    const promotionalBannersExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'promotional_banners'
      );
    `;
    
    console.log('promotional_banners table exists:', promotionalBannersExists);
    
    // Check if product_discounts table exists
    const productDiscountsExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'product_discounts'
      );
    `;
    
    console.log('product_discounts table exists:', productDiscountsExists);
    
    // Check if product_notifications table exists
    const productNotificationsExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'product_notifications'
      );
    `;
    
    console.log('product_notifications table exists:', productNotificationsExists);
    
    // List all tables
    const allTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('All tables in database:', allTables);
    
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
