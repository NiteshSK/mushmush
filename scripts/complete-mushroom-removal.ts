import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Complete mushroom removal - final attempt...')

  try {
    // First, let's see what's actually in the database
    console.log('📊 Current database state:')
    const currentProducts = await prisma.product.findMany({ select: { id: true, title: true } })
    const currentCategories = await prisma.category.findMany({ select: { id: true, title: true } })
    
    console.log(`Products found: ${currentProducts.length}`)
    currentProducts.forEach(p => console.log(`  - ${p.title} (ID: ${p.id})`))
    
    console.log(`Categories found: ${currentCategories.length}`)
    currentCategories.forEach(c => console.log(`  - ${c.title} (ID: ${c.id})`))

    // Force delete everything using raw SQL with CASCADE
    console.log('\n🧹 Force deleting all data...')
    
    // Disable foreign key checks temporarily
    await prisma.$executeRaw`SET session_replication_role = replica;`
    
    // Delete all data
    await prisma.$executeRaw`DELETE FROM "order_items";`
    await prisma.$executeRaw`DELETE FROM "orders";`
    await prisma.$executeRaw`DELETE FROM "recently_viewed";`
    await prisma.$executeRaw`DELETE FROM "wishlist_items";`
    await prisma.$executeRaw`DELETE FROM "reviews";`
    await prisma.$executeRaw`DELETE FROM "product_categories";`
    await prisma.$executeRaw`DELETE FROM "products";`
    await prisma.$executeRaw`DELETE FROM "categories";`
    
    // Reset sequences
    await prisma.$executeRaw`ALTER SEQUENCE products_id_seq RESTART WITH 1;`
    await prisma.$executeRaw`ALTER SEQUENCE categories_id_seq RESTART WITH 1;`
    
    // Re-enable foreign key checks
    await prisma.$executeRaw`SET session_replication_role = DEFAULT;`
    
    console.log('✅ All data deleted with CASCADE')

    // Final verification
    const finalProducts = await prisma.product.count()
    const finalCategories = await prisma.category.count()
    
    console.log(`\n📊 Final verification:`)
    console.log(`   Products remaining: ${finalProducts}`)
    console.log(`   Categories remaining: ${finalCategories}`)
    
    if (finalProducts === 0 && finalCategories === 0) {
      console.log('🎉 SUCCESS: All mushroom data completely removed!')
    } else {
      console.log('⚠️  Data still persists - may need manual database intervention')
    }

  } catch (error) {
    console.error('❌ Error during complete removal:', error)
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
