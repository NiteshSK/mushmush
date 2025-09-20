import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Testing blog views API...')
    
    const slug = 'growing-oyster-mushrooms-guide'
    
    // Check current views
    const beforePost = await prisma.blogPost.findUnique({
      where: { slug }
    })
    
    if (!beforePost) {
      console.log('❌ Blog post not found. Please run: npm run db:seed:blog')
      return
    }
    
    console.log('Before API call:')
    console.log('  Views:', beforePost.views)
    
    // Simulate API call by directly incrementing
    const afterPost = await prisma.blogPost.update({
      where: { slug },
      data: {
        views: {
          increment: 1
        }
      }
    })
    
    console.log('After increment:')
    console.log('  Views:', afterPost.views)
    console.log('✅ Database increment works!')
    
    // Test the slug format
    console.log('\nSlug being used:', slug)
    console.log('Expected API endpoint:', `/api/blog/${slug}/views`)
    
  } catch (error) {
    console.error('Error testing blog API:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
