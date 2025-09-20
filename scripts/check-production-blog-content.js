const { PrismaClient } = require('@prisma/client');

async function checkProductionBlogContent() {
  console.log('🔍 Checking blog content in production database...\n');

  // Use production database URL from environment or default
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://username:password@host:port/database';
  
  console.log(`📡 Connecting to database...`);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });

  try {
    // Get all blog posts
    const blogPosts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        createdAt: true,
        published: true
      }
    });

    console.log(`📊 Found ${blogPosts.length} blog posts in production:\n`);

    blogPosts.forEach((post, index) => {
      console.log(`📝 Blog Post #${index + 1}:`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Title: ${post.title}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Published: ${post.published}`);
      console.log(`   Content Length: ${post.content ? post.content.length : 0} characters`);
      
      if (post.content && post.content.length > 0) {
        const preview = post.content.substring(0, 200);
        console.log(`   Content Preview: ${preview}...`);
        
        // Check if content is truncated
        if (post.content.length < 100) {
          console.log(`   ❌ CRITICAL: Content appears to be truncated (${post.content.length} chars)`);
        } else if (post.content.length < 500) {
          console.log(`   ⚠️  WARNING: Content seems very short (${post.content.length} chars)`);
        } else {
          console.log(`   ✅ Content has substantial length`);
        }
        
        // Check for common truncation patterns
        if (post.content.includes('...')) {
          console.log(`   🔍 Contains ellipsis (...) - might be truncated`);
        }
        if (post.content.length === 30) {
          console.log(`   🔍 Exactly 30 characters - likely truncated by database or application`);
        }
      } else {
        console.log(`   ❌ ERROR: No content found!`);
      }

      console.log(`   Excerpt: ${post.excerpt || 'No excerpt'}`);
      console.log(`   Created: ${post.createdAt}`);
      console.log(`   ---`);
    });

    // Summary statistics
    const postsWithContent = blogPosts.filter(post => post.content && post.content.length > 0);
    const postsWithShortContent = blogPosts.filter(post => post.content && post.content.length < 100);
    const postsWithVeryShortContent = blogPosts.filter(post => post.content && post.content.length === 30);
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total posts: ${blogPosts.length}`);
    console.log(`   Posts with content: ${postsWithContent.length}`);
    console.log(`   Posts with short content (< 100 chars): ${postsWithShortContent.length}`);
    console.log(`   Posts with exactly 30 chars (likely truncated): ${postsWithVeryShortContent.length}`);

    if (postsWithVeryShortContent.length > 0) {
      console.log(`\n❌ CRITICAL: ${postsWithVeryShortContent.length} posts appear to be truncated to exactly 30 characters!`);
      console.log(`   This suggests a database or application-level truncation issue.`);
    }

    if (postsWithShortContent.length > 0) {
      console.log(`\n⚠️  WARNING: ${postsWithShortContent.length} posts have very short content`);
    }

    if (postsWithVeryShortContent.length === 0 && postsWithShortContent.length === 0) {
      console.log(`\n✅ All blog posts have substantial content in the database`);
      console.log(`   The truncation issue might be in the API response or frontend rendering`);
    }

  } catch (error) {
    console.error('❌ Error checking blog content:', error.message);
    console.error('Make sure your DATABASE_URL is set correctly for production');
    console.error('You may need to set the production database URL in your environment variables');
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionBlogContent();
