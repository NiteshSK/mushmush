import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixProductionCategoryPaths() {
  console.log('🔧 Fixing production category paths...')

  try {
    // Update category paths to use /shop instead of /shop-without-sidebar
    const updates = await Promise.all([
      prisma.category.updateMany({
        where: { slug: 'all-mushrooms' },
        data: { path: '/shop' }
      }),
      prisma.category.updateMany({
        where: { slug: 'edible' },
        data: { path: '/shop?category=edible' }
      }),
      prisma.category.updateMany({
        where: { slug: 'medicinal' },
        data: { path: '/shop?category=medicinal' }
      }),
      prisma.category.updateMany({
        where: { slug: 'tinctures' },
        data: { path: '/shop?category=tinctures' }
      }),
      prisma.category.updateMany({
        where: { slug: 'powders' },
        data: { path: '/shop?category=powders' }
      })
    ])

    console.log('✅ Updated production category paths successfully')

    // Verify the updates
    const categories = await prisma.category.findMany({
      select: {
        title: true,
        slug: true,
        path: true
      }
    })

    console.log('📋 Current category paths:')
    categories.forEach(cat => {
      console.log(`  - ${cat.title} (${cat.slug}): ${cat.path}`)
    })

  } catch (error) {
    console.error('❌ Error updating production category paths:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
fixProductionCategoryPaths()
  .then(() => {
    console.log('🎉 Production category paths fixed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Failed to fix production category paths:', error)
    process.exit(1)
  })
