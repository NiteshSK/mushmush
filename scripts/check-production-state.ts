import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking production database state...')

  try {
    // Check current state
    const categories = await prisma.category.findMany({
      select: { id: true, title: true, slug: true }
    })
    
    const products = await prisma.product.findMany({
      select: { id: true, title: true, inStock: true }
    })

    const productCategories = await prisma.productCategory.findMany({
      include: {
        category: { select: { title: true } },
        product: { select: { title: true } }
      }
    })

    console.log(`📊 Current production state:`)
    console.log(`   Categories: ${categories.length}`)
    categories.forEach(c => console.log(`     - ${c.title} (${c.slug})`))
    
    console.log(`   Products: ${products.length}`)
    products.forEach(p => console.log(`     - ${p.title} (${p.inStock ? 'In Stock' : 'Out of Stock'})`))
    
    console.log(`   Product-Category relationships: ${productCategories.length}`)

    // Check if "All Mushrooms" category exists
    const allMushroomsExists = categories.find(c => c.slug === 'all-mushrooms')
    if (allMushroomsExists) {
      console.log('⚠️  "All Mushrooms" category still exists')
    } else {
      console.log('✅ "All Mushrooms" category successfully removed')
    }

  } catch (error) {
    console.error('❌ Error checking production state:', error)
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
