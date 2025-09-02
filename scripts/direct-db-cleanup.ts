import { PrismaClient } from '@prisma/client'

// Create a fresh Prisma client instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function main() {
  console.log('🔥 Direct database cleanup - bypassing all caches...')

  try {
    // Connect explicitly
    await prisma.$connect()
    console.log('✅ Connected to database')

    // Use raw SQL to directly delete from the database
    console.log('🗑️  Executing direct SQL deletions...')
    
    // Delete in proper order to handle foreign keys
    await prisma.$executeRaw`DELETE FROM "order_items"`
    await prisma.$executeRaw`DELETE FROM "orders"`
    await prisma.$executeRaw`DELETE FROM "recently_viewed"`
    await prisma.$executeRaw`DELETE FROM "wishlist_items"`
    await prisma.$executeRaw`DELETE FROM "reviews"`
    await prisma.$executeRaw`DELETE FROM "product_categories"`
    await prisma.$executeRaw`DELETE FROM "products"`
    await prisma.$executeRaw`DELETE FROM "categories"`
    
    // Reset auto-increment sequences
    await prisma.$executeRaw`ALTER SEQUENCE IF EXISTS "products_id_seq" RESTART WITH 1`
    await prisma.$executeRaw`ALTER SEQUENCE IF EXISTS "categories_id_seq" RESTART WITH 1`
    
    console.log('✅ Direct SQL deletions completed')

    // Verify with fresh queries
    const productCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "products"`
    const categoryCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "categories"`
    
    console.log('📊 Direct count verification:')
    console.log('Products:', productCount)
    console.log('Categories:', categoryCount)

    // Also verify with Prisma client
    const prismaProductCount = await prisma.product.count()
    const prismaCategoryCount = await prisma.category.count()
    
    console.log('📊 Prisma client verification:')
    console.log(`Products: ${prismaProductCount}`)
    console.log(`Categories: ${prismaCategoryCount}`)

    if (prismaProductCount === 0 && prismaCategoryCount === 0) {
      console.log('🎉 SUCCESS: Database is now completely clean!')
    } else {
      console.log('⚠️  Data still exists - investigating further...')
    }

  } catch (error) {
    console.error('❌ Error during direct cleanup:', error)
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
