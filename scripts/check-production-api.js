const https = require('https');

// Replace with your actual production domain
const PRODUCTION_DOMAIN = 'www.mushmush.in';

async function checkAPIEndpoints() {
  console.log('🔍 Checking production API endpoints...\n');

  try {
    // Check blog listing API
    console.log('📡 Testing /api/blog endpoint...');
    const blogListResponse = await fetchAPI(`/api/blog`);
    
    if (blogListResponse.success) {
      console.log(`✅ Blog listing API successful`);
      console.log(`   Found ${blogListResponse.data.posts?.length || 0} posts`);
      
      if (blogListResponse.data.posts && blogListResponse.data.posts.length > 0) {
        const firstPost = blogListResponse.data.posts[0];
        console.log(`   First post: ${firstPost.title}`);
        console.log(`   Content length: ${firstPost.content ? firstPost.content.length : 0} chars`);
        
        // Test individual blog post API
        console.log(`\n📡 Testing /api/blog/${firstPost.slug} endpoint...`);
        const singlePostResponse = await fetchAPI(`/api/blog/${firstPost.slug}`);
        
        if (singlePostResponse.success) {
          console.log(`✅ Single blog post API successful`);
          const blogPost = singlePostResponse.data.blogPost;
          console.log(`   Title: ${blogPost.title}`);
          console.log(`   Content length: ${blogPost.content ? blogPost.content.length : 0} chars`);
          
          if (blogPost.content && blogPost.content.length > 0) {
            const preview = blogPost.content.substring(0, 200);
            console.log(`   Content preview: ${preview}...`);
            
            if (blogPost.content.length < 500) {
              console.log(`   ⚠️  WARNING: Content seems very short (${blogPost.content.length} chars)`);
            } else {
              console.log(`   ✅ Content has substantial length`);
            }
          } else {
            console.log(`   ❌ ERROR: No content in API response!`);
          }
        } else {
          console.log(`❌ Single blog post API failed: ${singlePostResponse.error}`);
        }
      }
    } else {
      console.log(`❌ Blog listing API failed: ${blogListResponse.error}`);
      
      // If we got a redirect, let's try to follow it and see where it goes
      if (blogListResponse.redirected) {
        console.log(`   🔄 Redirect detected to: ${blogListResponse.finalUrl}`);
        console.log(`   📍 This suggests authentication or routing issues`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking API endpoints:', error);
  }
}

function fetchAPI(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: PRODUCTION_DOMAIN,
      port: 443,
      path: endpoint,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MushMush-Blog-Checker/1.0',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      let finalUrl = endpoint;
      let redirected = false;
      
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        const location = res.headers['location'];
        if (location) {
          redirected = true;
          finalUrl = location;
          console.log(`   🔄 Redirect ${res.statusCode} to: ${location}`);
          
          // Follow the redirect
          const redirectOptions = {
            hostname: new URL(location).hostname,
            port: 443,
            path: new URL(location).pathname + new URL(location).search,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'MushMush-Blog-Checker/1.0',
              'Accept': 'application/json'
            }
          };
          
          const redirectReq = https.request(redirectOptions, (redirectRes) => {
            let redirectData = '';
            
            redirectRes.on('data', (chunk) => {
              redirectData += chunk;
            });
            
            redirectRes.on('end', () => {
              try {
                if (redirectRes.statusCode === 200) {
                  const parsedData = JSON.parse(redirectData);
                  resolve({ 
                    success: true, 
                    data: parsedData, 
                    redirected: true, 
                    finalUrl: location 
                  });
                } else {
                  resolve({ 
                    success: false, 
                    error: `Redirect failed with HTTP ${redirectRes.statusCode}: ${redirectRes.statusMessage}`,
                    redirected: true,
                    finalUrl: location
                  });
                }
              } catch (error) {
                resolve({ 
                  success: false, 
                  error: `Redirect JSON Parse Error: ${error.message}`,
                  redirected: true,
                  finalUrl: location
                });
              }
            });
          });
          
          redirectReq.on('error', (error) => {
            resolve({ 
              success: false, 
              error: `Redirect Request Error: ${error.message}`,
              redirected: true,
              finalUrl: location
            });
          });
          
          redirectReq.setTimeout(10000, () => {
            redirectReq.destroy();
            resolve({ 
              success: false, 
              error: 'Redirect request timeout after 10 seconds',
              redirected: true,
              finalUrl: location
            });
          });
          
          redirectReq.end();
          return;
        }
      }
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const parsedData = JSON.parse(data);
            resolve({ success: true, data: parsedData, redirected: false, finalUrl: endpoint });
          } else {
            // If not JSON, show the response content for debugging
            let errorDetails = `HTTP ${res.statusCode}: ${res.statusMessage}`;
            if (data && data.length > 0) {
              errorDetails += `\n   Response content: ${data.substring(0, 200)}...`;
            }
            resolve({ 
              success: false, 
              error: errorDetails,
              redirected: false,
              finalUrl: endpoint
            });
          }
        } catch (error) {
          resolve({ 
            success: false, 
            error: `JSON Parse Error: ${error.message}\n   Response content: ${data.substring(0, 200)}...`,
            redirected: false,
            finalUrl: endpoint
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ 
        success: false, 
        error: `Request Error: ${error.message}`,
        redirected: false,
        finalUrl: endpoint
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ 
        success: false, 
        error: 'Request timeout after 10 seconds',
        redirected: false,
        finalUrl: endpoint
      });
    });

    req.end();
  });
}

// Instructions for the user
console.log('🚀 Production Blog Data Checker');
console.log('================================');
console.log('⚠️  IMPORTANT: Before running this script:');
console.log(`   1. Update PRODUCTION_DOMAIN in this script to your actual domain`);
console.log(`   2. Make sure your production site is accessible`);
console.log(`   3. Run: node scripts/check-production-api.js\n`);

checkAPIEndpoints();
