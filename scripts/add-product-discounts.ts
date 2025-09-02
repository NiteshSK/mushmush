import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addProductDiscounts() {
  try {
    console.log('🔍 Finding products...')
    
    // Find products by title
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: "Lion's Mane", mode: 'insensitive' } },
          { title: { contains: "Oyster Mushroom", mode: 'insensitive' } },
          { title: { contains: "Chantrelle", mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        title: true,
        price: true
      }
    })

    console.log('📦 Found products:', products)

    // Clear existing discounts for these products
    const productIds = products.map(p => p.id)
    if (productIds.length > 0) {
      await prisma.productDiscount.deleteMany({
        where: {
          productId: { in: productIds }
        }
      })
      console.log('🗑️ Cleared existing discounts')
    }

    // Define discount mappings
    const discountMappings = [
      { name: "Lion's Mane", percentage: 4 },
      { name: "Oyster Mushroom", percentage: 2 },
      { name: "Chantrelle", percentage: 5 }
    ]

    // Add new discounts
    for (const product of products) {
      const discountMapping = discountMappings.find(dm => 
        product.title.toLowerCase().includes(dm.name.toLowerCase())
      )

      if (discountMapping) {
        const discount = await prisma.productDiscount.create({
          data: {
            productId: product.id,
            type: 'PERCENTAGE',
            value: discountMapping.percentage,
            isActive: true,
            startDate: new Date(),
            endDate: null // No end date - permanent discount
          }
        })

        console.log(`✅ Added ${discountMapping.percentage}% discount to "${product.title}" (ID: ${product.id})`)
      }
    }

    console.log('🎉 Product discounts added successfully!')
    
  } catch (error) {
    console.error('❌ Error adding product discounts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addProductDiscounts()
