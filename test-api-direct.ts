#!/usr/bin/env tsx

// Test the API endpoint directly
const testApi = async () => {
  try {
    console.log('🔍 Testing API endpoint directly...');
    
    const response = await fetch('http://localhost:3000/api/promotional-banners?limit=5', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📦 Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data.length > 0) {
      console.log('✅ API is working and returning banners!');
      console.log(`📊 Found ${data.data.length} banners`);
    } else {
      console.log('❌ API returned no banners or error');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
    console.log('💡 Make sure the development server is running: npm run dev');
  }
};

testApi();
