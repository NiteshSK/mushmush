import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Starting mushroom removal process...')

  try {
    // First, delete all product-category relationships
    console.log('Removing product-category relationships...')
    await prisma.productCategory.deleteMany({})

    // Delete all products (all current products are mushroom-related)
    console.log('Removing all products...')
    const deletedProducts = await prisma.product.deleteMany({})
    console.log(`✅ Removed ${deletedProducts.count} products`)

    // Delete all categories (all current categories are mushroom-related)
    console.log('Removing all categories...')
    const deletedCategories = await prisma.category.deleteMany({})
    console.log(`✅ Removed ${deletedCategories.count} categories`)

    // Also clean up any related data
    console.log('Cleaning up related data...')
    
    // Delete reviews (since all products are being removed)
    const deletedReviews = await prisma.review.deleteMany({})
    console.log(`✅ Removed ${deletedReviews.count} reviews`)

    // Delete wishlist items
    const deletedWishlistItems = await prisma.wishlistItem.deleteMany({})
    console.log(`✅ Removed ${deletedWishlistItems.count} wishlist items`)

    // Delete recently viewed items
    const deletedRecentlyViewed = await prisma.recentlyViewed.deleteMany({})
    console.log(`✅ Removed ${deletedRecentlyViewed.count} recently viewed items`)

    // Delete order items and orders
    const deletedOrderItems = await prisma.orderItem.deleteMany({})
    console.log(`✅ Removed ${deletedOrderItems.count} order items`)
    
    const deletedOrders = await prisma.order.deleteMany({})
    console.log(`✅ Removed ${deletedOrders.count} orders`)

    console.log('🎉 All mushroom-related data has been successfully removed!')
    console.log('📝 Note: Blog posts have been kept as they may contain valuable content.')

  } catch (error) {
    console.error('❌ Error during removal process:', error)
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
