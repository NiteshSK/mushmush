import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Force removing ALL data...')

  try {
    // Delete in proper order to avoid foreign key constraints
    console.log('Removing order items...')
    await prisma.orderItem.deleteMany({})
    
    console.log('Removing orders...')
    await prisma.order.deleteMany({})
    
    console.log('Removing recently viewed...')
    await prisma.recentlyViewed.deleteMany({})
    
    console.log('Removing wishlist items...')
    await prisma.wishlistItem.deleteMany({})
    
    console.log('Removing reviews...')
    await prisma.review.deleteMany({})
    
    console.log('Removing product-category relationships...')
    await prisma.productCategory.deleteMany({})
    
    console.log('Removing products...')
    const deletedProducts = await prisma.product.deleteMany({})
    console.log(`✅ Removed ${deletedProducts.count} products`)
    
    console.log('Removing categories...')
    const deletedCategories = await prisma.category.deleteMany({})
    console.log(`✅ Removed ${deletedCategories.count} categories`)

    // Verify removal
    const remainingProducts = await prisma.product.count()
    const remainingCategories = await prisma.category.count()
    
    console.log(`📊 Verification:`)
    console.log(`   Products remaining: ${remainingProducts}`)
    console.log(`   Categories remaining: ${remainingCategories}`)
    
    if (remainingProducts === 0 && remainingCategories === 0) {
      console.log('🎉 All data successfully removed!')
    } else {
      console.log('⚠️  Some data still remains')
    }

  } catch (error) {
    console.error('❌ Error during removal:', error)
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
