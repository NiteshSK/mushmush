const https = require('https');

const PRODUCTION_DOMAIN = 'www.mushmush.in';

async function testProductsAPI() {
  console.log('🔍 Testing products API endpoint in production...\n');

  try {
    // First test the products listing API
    console.log('📡 Testing /api/products endpoint...');
    const listResponse = await fetchAPI(`/api/products`);
    
    if (listResponse.success) {
      console.log(`✅ Products listing API successful`);
      console.log(`   Found ${listResponse.data.products?.length || 0} products`);

      if (listResponse.data.products && listResponse.data.products.length > 0) {
        const firstProduct = listResponse.data.products[0];
        console.log(`   First product: ${firstProduct.name}`);
        console.log(`   ID: ${firstProduct.id}`);
        console.log(`   Slug: ${firstProduct.slug}`);

        // Test individual product API by ID
        console.log(`\n📡 Testing /api/products/${firstProduct.id} endpoint...`);
        const idResponse = await fetchAPI(`/api/products/${firstProduct.id}`);

        if (idResponse.success) {
          console.log(`✅ Product by ID API successful`);
          const product = idResponse.data.product;
          console.log(`   Name: ${product.name}`);
          console.log(`   Description length: ${product.description ? product.description.length : 0} chars`);
        } else {
          console.log(`❌ Product by ID API failed: ${idResponse.error}`);
        }

        // Test individual product API by slug (if available)
        if (firstProduct.slug) {
          console.log(`\n📡 Testing /api/products/${firstProduct.slug} endpoint...`);
          const slugResponse = await fetchAPI(`/api/products/${firstProduct.slug}`);

          if (slugResponse.success) {
            console.log(`✅ Product by slug API successful`);
            const product = slugResponse.data.product;
            console.log(`   Name: ${product.name}`);
            console.log(`   Description length: ${product.description ? product.description.length : 0} chars`);
          } else {
            console.log(`❌ Product by slug API failed: ${slugResponse.error}`);
          }
        }
      } else {
        console.log(`   ⚠️  No products found`);
      }
    } else {
      console.log(`❌ Products listing API failed: ${listResponse.error}`);
    }
  } catch (error) {
    console.error('❌ Error testing products API:', error.message);
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

testProductsAPI();
