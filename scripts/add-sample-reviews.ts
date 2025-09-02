import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addSampleReviews() {
  console.log('🌱 Adding sample reviews...')

  // Get some products to add reviews to
  const products = await prisma.product.findMany({
    take: 4
  })

  if (products.length === 0) {
    console.log('No products found. Please run seed first.')
    return
  }

  // Create a sample user for reviews
  const sampleUser = await prisma.user.upsert({
    where: { email: 'reviewer@example.com' },
    update: {},
    create: {
      email: 'reviewer@example.com',
      name: 'Sample Reviewer',
      role: 'CUSTOMER'
    }
  })

  // Add multiple reviews to different products
  const reviewsData = [
    // Product 1 - High reviews (BestSeller)
    { productId: products[0].id, userId: sampleUser.id, rating: 5 },
    { productId: products[0].id, userId: null, rating: 4 }, // Anonymous review
    { productId: products[0].id, userId: null, rating: 5 },
    { productId: products[0].id, userId: null, rating: 4 },
    { productId: products[0].id, userId: null, rating: 5 },
    { productId: products[0].id, userId: null, rating: 3 },
    
    // Product 2 - Medium reviews
    { productId: products[1].id, userId: sampleUser.id, rating: 4 },
    { productId: products[1].id, userId: null, rating: 3 },
    { productId: products[1].id, userId: null, rating: 4 },
    
    // Product 3 - Few reviews
    { productId: products[2].id, userId: null, rating: 5 },
    { productId: products[2].id, userId: null, rating: 4 },
    
    // Product 4 - Single review
    { productId: products[3].id, userId: sampleUser.id, rating: 3 },
  ]

  for (const reviewData of reviewsData) {
    await prisma.review.create({
      data: reviewData
    })
  }

  console.log('✅ Sample reviews added')
  console.log(`Added reviews for ${products.length} products:`)
  
  for (const product of products) {
    const reviewCount = await prisma.review.count({
      where: { productId: product.id }
    })
    const avgRating = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true }
    })
    
    console.log(`- ${product.title}: ${reviewCount} reviews, avg ${avgRating._avg.rating?.toFixed(1) || 0} stars`)
  }
}

addSampleReviews()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
