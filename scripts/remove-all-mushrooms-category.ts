import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎯 Removing only "All Mushrooms" category...')

  try {
    // First, find the "All Mushrooms" category
    const allMushroomsCategory = await prisma.category.findUnique({
      where: { slug: 'all-mushrooms' },
      include: {
        products: {
          include: {
            product: {
              select: { title: true }
            }
          }
        }
      }
    })

    if (!allMushroomsCategory) {
      console.log('ℹ️  "All Mushrooms" category not found - nothing to remove')
      return
    }

    console.log(`📂 Found "All Mushrooms" category with ${allMushroomsCategory.products.length} product relationships`)
    
    // Remove product-category relationships for this category only
    if (allMushroomsCategory.products.length > 0) {
      console.log('🔗 Removing product relationships for "All Mushrooms" category...')
      await prisma.productCategory.deleteMany({
        where: {
          categoryId: allMushroomsCategory.id
        }
      })
      console.log(`✅ Removed ${allMushroomsCategory.products.length} product relationships`)
    }

    // Delete the "All Mushrooms" category
    console.log('🗑️  Deleting "All Mushrooms" category...')
    await prisma.category.delete({
      where: { id: allMushroomsCategory.id }
    })
    console.log('✅ "All Mushrooms" category deleted')

    // Verify remaining categories
    const remainingCategories = await prisma.category.findMany({
      select: { title: true, slug: true }
    })
    
    console.log(`📊 Remaining categories (${remainingCategories.length}):`)
    remainingCategories.forEach(cat => console.log(`   - ${cat.title} (${cat.slug})`))

    // Verify products are still intact
    const productCount = await prisma.product.count()
    console.log(`📦 Products remaining: ${productCount}`)

    console.log('🎉 Successfully removed only "All Mushrooms" category!')

  } catch (error) {
    console.error('❌ Error during targeted removal:', error)
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
