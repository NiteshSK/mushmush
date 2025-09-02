import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verifying mushroom removal...')

  try {
    // Check categories
    const categories = await prisma.category.findMany()
    console.log(`📂 Categories remaining: ${categories.length}`)
    if (categories.length > 0) {
      console.log('Categories:', categories.map(c => c.title))
    }

    // Check products
    const products = await prisma.product.findMany()
    console.log(`📦 Products remaining: ${products.length}`)
    if (products.length > 0) {
      console.log('Products:', products.map(p => p.title))
    }

    // Check product-category relationships
    const productCategories = await prisma.productCategory.findMany()
    console.log(`🔗 Product-category relationships: ${productCategories.length}`)

    // Check other related data
    const reviews = await prisma.review.count()
    const wishlistItems = await prisma.wishlistItem.count()
    const recentlyViewed = await prisma.recentlyViewed.count()
    const orders = await prisma.order.count()
    const orderItems = await prisma.orderItem.count()

    console.log(`📊 Related data counts:`)
    console.log(`   Reviews: ${reviews}`)
    console.log(`   Wishlist items: ${wishlistItems}`)
    console.log(`   Recently viewed: ${recentlyViewed}`)
    console.log(`   Orders: ${orders}`)
    console.log(`   Order items: ${orderItems}`)

    // Check blog posts (should remain)
    const blogPosts = await prisma.blogPost.count()
    console.log(`📝 Blog posts (preserved): ${blogPosts}`)

    if (categories.length === 0 && products.length === 0) {
      console.log('✅ Verification successful: All mushroom products and categories have been removed!')
    } else {
      console.log('⚠️  Some data still remains in the database.')
    }

  } catch (error) {
    console.error('❌ Error during verification:', error)
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
