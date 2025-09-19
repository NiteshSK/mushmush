// Production authentication test script
const testProductionAuth = async () => {
  const baseUrl = process.env.PRODUCTION_URL || 'https://your-domain.com'; // Replace with your actual production URL
  
  console.log('🔍 Testing Production Google Sign-In Configuration\n');
  
  // Test 1: Check NextAuth providers
  console.log('1. Testing NextAuth providers...');
  try {
    const response = await fetch(`${baseUrl}/api/auth/providers`);
    const data = await response.json();
    
    console.log('Providers response:', JSON.stringify(data, null, 2));
    
    if (data.google) {
      console.log('✅ Google provider is configured');
      console.log('   Client ID:', data.google.clientId ? '✅ Set' : '❌ Missing');
      console.log('   Client Secret:', data.google.clientSecret ? '✅ Set' : '❌ Missing');
    } else {
      console.log('❌ Google provider is NOT configured');
      console.log('   Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables');
    }
  } catch (error) {
    console.log('❌ Error fetching providers:', error.message);
  }
  
  console.log('\n2. Testing session endpoint...');
  try {
    const response = await fetch(`${baseUrl}/api/auth/session`);
    const data = await response.json();
    
    console.log('Session response:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.log('❌ Session error:', data.error);
    } else {
      console.log('✅ Session endpoint working');
    }
  } catch (error) {
    console.log('❌ Error testing session:', error.message);
  }
  
  console.log('\n3. Testing CSRF token...');
  try {
    const response = await fetch(`${baseUrl}/api/auth/csrf`);
    const data = await response.json();
    
    console.log('CSRF response:', JSON.stringify(data, null, 2));
    
    if (data.csrfToken) {
      console.log('✅ CSRF token available');
    } else {
      console.log('❌ CSRF token missing');
    }
  } catch (error) {
    console.log('❌ Error testing CSRF:', error.message);
  }
  
  console.log('\n📋 Production Configuration Checklist:');
  console.log('✅ GOOGLE_CLIENT_ID set in production environment');
  console.log('✅ GOOGLE_CLIENT_SECRET set in production environment');
  console.log('✅ NEXTAUTH_URL set to production URL (https://your-domain.com)');
  console.log('✅ NEXTAUTH_SECRET set in production environment');
  console.log('✅ Production redirect URI added to Google Cloud Console');
  console.log('✅ Domain properly configured in Google OAuth consent screen');
  
  console.log('\n🔧 Common Fixes for 302 Redirect Issues:');
  console.log('1. Update NEXTAUTH_URL to your production domain');
  console.log('2. Add production redirect URI to Google Cloud Console');
  console.log('3. Ensure all environment variables are set in Vercel');
  console.log('4. Check that your domain is verified in Google Cloud Console');
  console.log('5. Verify OAuth consent screen is configured for production');
};

testProductionAuth().catch(console.error);
