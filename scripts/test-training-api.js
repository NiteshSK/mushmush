const https = require('https');

const PRODUCTION_DOMAIN = 'www.mushmush.in';

async function testTrainingAPI() {
  console.log('🔍 Testing training programs API endpoint in production...\n');

  try {
    // First test the training programs listing API
    console.log('📡 Testing /api/training-programs endpoint...');
    const listResponse = await fetchAPI(`/api/training-programs`);
    
    if (listResponse.success) {
      console.log(`✅ Training programs listing API successful`);
      console.log(`   Found ${listResponse.data.trainingPrograms?.length || 0} programs`);

      if (listResponse.data.trainingPrograms && listResponse.data.trainingPrograms.length > 0) {
        const firstProgram = listResponse.data.trainingPrograms[0];
        console.log(`   First program: ${firstProgram.title}`);
        console.log(`   ID: ${firstProgram.id}`);
        console.log(`   Slug: ${firstProgram.slug}`);

        // Test individual training program API by ID
        console.log(`\n📡 Testing /api/training-programs/${firstProgram.id} endpoint...`);
        const idResponse = await fetchAPI(`/api/training-programs/${firstProgram.id}`);

        if (idResponse.success) {
          console.log(`✅ Training program by ID API successful`);
          const program = idResponse.data.trainingProgram;
          console.log(`   Title: ${program.title}`);
          console.log(`   Description length: ${program.description ? program.description.length : 0} chars`);
        } else {
          console.log(`❌ Training program by ID API failed: ${idResponse.error}`);
        }

        // Test individual training program API by slug (if available)
        if (firstProgram.slug) {
          console.log(`\n📡 Testing /api/training-programs/${firstProgram.slug} endpoint...`);
          const slugResponse = await fetchAPI(`/api/training-programs/${firstProgram.slug}`);

          if (slugResponse.success) {
            console.log(`✅ Training program by slug API successful`);
            const program = slugResponse.data.trainingProgram;
            console.log(`   Title: ${program.title}`);
            console.log(`   Description length: ${program.description ? program.description.length : 0} chars`);
          } else {
            console.log(`❌ Training program by slug API failed: ${slugResponse.error}`);
          }
        }
      } else {
        console.log(`   ⚠️  No training programs found`);
      }
    } else {
      console.log(`❌ Training programs listing API failed: ${listResponse.error}`);
    }
  } catch (error) {
    console.error('❌ Error testing training API:', error.message);
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

testTrainingAPI();
