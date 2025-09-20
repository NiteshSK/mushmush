const { PrismaClient } = require('@prisma/client');

async function checkBlogData() {
  console.log('🔍 Checking blog data in production...\n');

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://username:password@host:port/database'
      }
    }
  });

  try {
    // Get all published blog posts
    const blogPosts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        createdAt: true,
        views: true
      }
    });

    console.log(`📊 Found ${blogPosts.length} published blog posts:\n`);

    blogPosts.forEach((post, index) => {
      console.log(`📝 Blog Post #${index + 1}:`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Title: ${post.title}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Content Length: ${post.content ? post.content.length : 0} characters`);
      console.log(`   Excerpt: ${post.excerpt || 'No excerpt'}`);
      console.log(`   Views: ${post.views}`);
      console.log(`   Created: ${post.createdAt}`);
      
      // Show content preview
      if (post.content && post.content.length > 0) {
        const preview = post.content.substring(0, 200);
        console.log(`   Content Preview: ${preview}...`);
        
        // Check if content seems truncated
        if (post.content.length < 500) {
          console.log(`   ⚠️  WARNING: Content seems very short (${post.content.length} chars)`);
        }
      } else {
        console.log(`   ❌ ERROR: No content found!`);
      }
      
      console.log(`   ---`);
    });

    // Check for potential issues
    const postsWithNoContent = blogPosts.filter(post => !post.content || post.content.length === 0);
    const postsWithShortContent = blogPosts.filter(post => post.content && post.content.length < 500);
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total posts: ${blogPosts.length}`);
    console.log(`   Posts with no content: ${postsWithNoContent.length}`);
    console.log(`   Posts with short content (< 500 chars): ${postsWithShortContent.length}`);
    
    if (postsWithNoContent.length > 0) {
      console.log(`\n❌ CRITICAL: ${postsWithNoContent.length} posts have no content!`);
    }
    
    if (postsWithShortContent.length > 0) {
      console.log(`\n⚠️  WARNING: ${postsWithShortContent.length} posts have very short content`);
    }

    if (postsWithNoContent.length === 0 && postsWithShortContent.length === 0) {
      console.log(`\n✅ All blog posts have substantial content`);
    }

  } catch (error) {
    console.error('❌ Error checking blog data:', error.message);
    console.error('Make sure your DATABASE_URL is set correctly');
  } finally {
    await prisma.$disconnect();
  }
}

checkBlogData();
