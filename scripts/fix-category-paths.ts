import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixCategoryPaths() {
  console.log('🔧 Fixing category paths...')

  try {
    // Update category paths to use /shop instead of /shop-without-sidebar
    const updates = await Promise.all([
      prisma.category.update({
        where: { slug: 'all-mushrooms' },
        data: { path: '/shop' }
      }),
      prisma.category.update({
        where: { slug: 'edible' },
        data: { path: '/shop?category=edible' }
      }),
      prisma.category.update({
        where: { slug: 'medicinal' },
        data: { path: '/shop?category=medicinal' }
      }),
      prisma.category.update({
        where: { slug: 'tinctures' },
        data: { path: '/shop?category=tinctures' }
      }),
      prisma.category.update({
        where: { slug: 'powders' },
        data: { path: '/shop?category=powders' }
      })
    ])

    console.log('✅ Updated category paths:')
    updates.forEach(category => {
      console.log(`  - ${category.title}: ${category.path}`)
    })

  } catch (error) {
    console.error('❌ Error updating category paths:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCategoryPaths()
