import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDiscountData() {
  try {
    console.log('🧹 Cleaning discount data...')
    
    // Find all products with their current discounts
    const productsWithDiscounts = await prisma.product.findMany({
      include: {
        discounts: {
          where: { isActive: true }
        }
      }
    })

    console.log('📦 Products with active discounts:')
    productsWithDiscounts.forEach(product => {
      if (product.discounts.length > 0) {
        console.log(`- ${product.title}: ${product.discounts[0].value}% discount`)
      }
    })

    // Clear ALL existing discounts first
    await prisma.productDiscount.deleteMany({})
    console.log('🗑️ Cleared all existing discounts')

    // Find the specific products we want to have discounts
    const targetProducts = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: "Lion's Mane", mode: 'insensitive' } },
          { title: { contains: "Oyster Mushroom", mode: 'insensitive' } },
          { title: { contains: "Chantrelle", mode: 'insensitive' } }
        ]
      }
    })

    console.log('🎯 Target products found:', targetProducts.map(p => p.title))

    // Define the exact discount mappings
    const discountMappings = [
      { name: "Lion's Mane", percentage: 4 },
      { name: "Oyster Mushroom", percentage: 2 },
      { name: "Chantrelle", percentage: 5 }
    ]

    // Add discounts only to the specified products
    for (const product of targetProducts) {
      const discountMapping = discountMappings.find(dm => 
        product.title.toLowerCase().includes(dm.name.toLowerCase())
      )

      if (discountMapping) {
        await prisma.productDiscount.create({
          data: {
            productId: product.id,
            type: 'PERCENTAGE',
            value: discountMapping.percentage,
            isActive: true,
            startDate: new Date(),
            endDate: null
          }
        })

        console.log(`✅ Added ${discountMapping.percentage}% discount to "${product.title}"`)
      }
    }

    console.log('🎉 Discount cleanup completed!')
    
  } catch (error) {
    console.error('❌ Error cleaning discount data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDiscountData()
