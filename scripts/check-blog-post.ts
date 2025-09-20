import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Checking blog post...')
    
    const blogPost = await prisma.blogPost.findUnique({
      where: { slug: 'growing-oyster-mushrooms-guide' }
    })

    if (blogPost) {
      console.log('✅ Blog post found:')
      console.log('  Title:', blogPost.title)
      console.log('  Slug:', blogPost.slug)
      console.log('  Views:', blogPost.views)
      console.log('  Published:', blogPost.published)
      console.log('  Excerpt:', blogPost.excerpt ? 'Present' : 'Missing')
      console.log('  Content:', blogPost.content ? 'Present (' + blogPost.content.length + ' chars)' : 'MISSING!')
      console.log('  Image:', blogPost.img || 'Not set')
      
      // Show first 200 characters of content if present
      if (blogPost.content) {
        console.log('  Content preview:', blogPost.content.substring(0, 200) + '...')
      }
    } else {
      console.log('❌ Blog post not found')
      
      // Check if there are any blog posts at all
      const allPosts = await prisma.blogPost.findMany()
      console.log('Total blog posts in database:', allPosts.length)
      
      if (allPosts.length > 0) {
        console.log('Existing blog posts:')
        allPosts.forEach(post => {
          console.log(`  - ${post.title} (${post.slug})`)
        })
      }
    }
  } catch (error) {
    console.error('Error checking blog post:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
