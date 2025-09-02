import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Nuclear cleanup - removing ALL data directly from database...')

  try {
    // Use raw SQL to ensure complete removal
    console.log('Dropping all foreign key constraints temporarily...')
    
    // Delete all data in correct order to avoid FK constraints
    await prisma.$executeRaw`TRUNCATE TABLE "order_items" CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "orders" CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "recently_viewed" CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "wishlist_items" CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "reviews" CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "product_categories" CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "products" RESTART IDENTITY CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "categories" RESTART IDENTITY CASCADE;`
    
    console.log('✅ All tables truncated')

    // Verify complete removal
    const productCount = await prisma.product.count()
    const categoryCount = await prisma.category.count()
    const productCategoryCount = await prisma.productCategory.count()
    
    console.log(`📊 Final verification:`)
    console.log(`   Products: ${productCount}`)
    console.log(`   Categories: ${categoryCount}`)
    console.log(`   Product-Category relations: ${productCategoryCount}`)
    
    if (productCount === 0 && categoryCount === 0 && productCategoryCount === 0) {
      console.log('🎉 Nuclear cleanup successful! All mushroom data eliminated.')
    } else {
      console.log('⚠️  Some data still remains after nuclear cleanup')
    }

  } catch (error) {
    console.error('❌ Error during nuclear cleanup:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
