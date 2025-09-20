const http = require('http');

const LOCAL_PORT = 3000;
const LOCAL_HOST = 'localhost';

async function testLocalAPI() {
  console.log('🔍 Testing local API endpoints...\n');

  // Test blog listing API
  console.log('📡 Testing /api/blog endpoint locally...');
  try {
    const blogListResponse = await fetchLocalAPI(`/api/blog`);
    
    if (blogListResponse.success) {
      console.log(`✅ Local blog listing API successful`);
      console.log(`   Found ${blogListResponse.data.posts?.length || 0} posts`);

      if (blogListResponse.data.posts && blogListResponse.data.posts.length > 0) {
        const firstPost = blogListResponse.data.posts[0];
        console.log(`   First post: ${firstPost.title}`);
        console.log(`   Content length: ${firstPost.content ? firstPost.content.length : 0} chars`);
        console.log(`   Slug: ${firstPost.slug}`);

        // Test individual blog post API
        console.log(`\n📡 Testing /api/blog/${firstPost.slug} endpoint locally...`);
        const singlePostResponse = await fetchLocalAPI(`/api/blog/${firstPost.slug}`);

        if (singlePostResponse.success) {
          console.log(`✅ Local single blog post API successful`);
          const blogPost = singlePostResponse.data.blogPost;
          console.log(`   Title: ${blogPost.title}`);
          console.log(`   Content length: ${blogPost.content ? blogPost.content.length : 0} chars`);

          if (blogPost.content && blogPost.content.length > 0) {
            const preview = blogPost.content.substring(0, 200);
            console.log(`   Content preview: ${preview}...`);

            if (blogPost.content.length < 100) {
              console.log(`   ⚠️  WARNING: Content seems very short (${blogPost.content.length} chars)`);
            } else {
              console.log(`   ✅ Content has substantial length`);
            }
          } else {
            console.log(`   ❌ ERROR: No content in API response!`);
          }
        } else {
          console.log(`❌ Local single blog post API failed: ${singlePostResponse.error}`);
        }
      }
    } else {
      console.log(`❌ Local blog listing API failed: ${blogListResponse.error}`);
    }
  } catch (error) {
    console.error('❌ Error testing local API:', error.message);
    console.log(`   💡 Make sure the development server is running on port ${LOCAL_PORT}`);
    console.log(`   💡 Run: npm run dev`);
  }
}

function fetchLocalAPI(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: LOCAL_HOST,
      port: LOCAL_PORT,
      path: endpoint,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MushMush-Blog-Checker/1.0',
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const parsedData = JSON.parse(data);
            resolve({ success: true, data: parsedData });
          } else {
            // Show response content for debugging
            let errorDetails = `HTTP ${res.statusCode}: ${res.statusMessage}`;
            if (data && data.length > 0) {
              const preview = data.substring(0, 200);
              errorDetails += `\n   Response preview: ${preview}...`;
              
              // Check if it's HTML
              if (data.includes('<!DOCTYPE') || data.includes('<html')) {
                errorDetails += `\n   📍 Response is HTML (likely error page)`;
              }
            }
            resolve({ success: false, error: errorDetails });
          }
        } catch (error) {
          resolve({ 
            success: false, 
            error: `JSON Parse Error: ${error.message}\n   Response: ${data.substring(0, 200)}...`
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: `Request Error: ${error.message}` });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ success: false, error: 'Request timeout after 10 seconds' });
    });

    req.end();
  });
}

testLocalAPI();
