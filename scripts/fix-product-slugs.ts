import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixProductSlugs() {
  console.log('🔧 Fixing product slugs...')

  try {
    // Find all products that don't have slugs or have empty slugs
    const productsWithoutSlugs = await prisma.product.findMany({
      where: {
        OR: [
          { slug: null },
          { slug: '' },
          { slug: { contains: ' ' } } // Slugs with spaces are invalid
        ]
      }
    })

    console.log(`Found ${productsWithoutSlugs.length} products without valid slugs`)

    for (const product of productsWithoutSlugs) {
      // Generate slug from title
      let slug = product.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
        .replace(/(^-|-$)/g, '') // Remove leading and trailing hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen

      // Ensure slug is unique
      let uniqueSlug = slug
      let counter = 1
      
      while (await prisma.product.findFirst({
        where: {
          slug: uniqueSlug,
          id: { not: product.id }
        }
      })) {
        uniqueSlug = `${slug}-${counter}`
        counter++
      }

      // Update the product with the new slug
      await prisma.product.update({
        where: { id: product.id },
        data: { slug: uniqueSlug }
      })

      console.log(`Updated product "${product.title}" with slug: "${uniqueSlug}"`)
    }

    // Also check for products with slugs that might need updating (e.g., if title changed)
    const allProducts = await prisma.product.findMany()
    
    for (const product of allProducts) {
      // Generate expected slug from title
      const expectedSlug = product.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .replace(/-+/g, '-')

      // If current slug doesn't match expected slug, consider updating it
      if (product.slug !== expectedSlug && !product.slug.includes('-')) {
        console.log(`Product "${product.title}" has slug "${product.slug}" but expected "${expectedSlug}"`)
        
        // Only update if the expected slug is available
        const existingProduct = await prisma.product.findFirst({
          where: {
            slug: expectedSlug,
            id: { not: product.id }
          }
        })

        if (!existingProduct) {
          await prisma.product.update({
            where: { id: product.id },
            data: { slug: expectedSlug }
          })
          console.log(`Updated slug for "${product.title}" to "${expectedSlug}"`)
        }
      }
    }

    console.log('✅ Product slugs have been fixed')
  } catch (error) {
    console.error('❌ Error fixing product slugs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixProductSlugs()
