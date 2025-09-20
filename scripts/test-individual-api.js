const https = require('https');

const PRODUCTION_DOMAIN = 'www.mushmush.in';

async function testIndividualAPI() {
  console.log('🔍 Testing individual blog post API endpoint...\n');

  const slug = 'growing-oyster-mushrooms-guide';
  const endpoint = `/api/blog/${slug}`;
  
  console.log(`📡 Testing: ${endpoint}`);
  
  try {
    const response = await fetchAPI(endpoint);
    
    if (response.success) {
      console.log(`✅ Individual blog post API successful`);
      console.log(`   Title: ${response.data.blogPost?.title || 'N/A'}`);
      console.log(`   Content length: ${response.data.blogPost?.content ? response.data.blogPost.content.length : 0} chars`);
      
      if (response.data.blogPost?.content) {
        const preview = response.data.blogPost.content.substring(0, 200);
        console.log(`   Content preview: ${preview}...`);
        
        if (response.data.blogPost.content.length < 100) {
          console.log(`   ⚠️  WARNING: Content seems very short (${response.data.blogPost.content.length} chars)`);
        } else {
          console.log(`   ✅ Content has substantial length`);
        }
      } else {
        console.log(`   ❌ ERROR: No content in API response!`);
      }
    } else {
      console.log(`❌ Individual blog post API failed: ${response.error}`);
      
      // If we got HTML response, show more details
      if (response.error.includes('<!DOCTYPE')) {
        console.log(`   📍 Got HTML response instead of JSON`);
        console.log(`   📍 This suggests the route doesn't exist or there's a routing issue`);
      }
    }
  } catch (error) {
    console.error('❌ Error testing individual API:', error.message);
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

testIndividualAPI();
