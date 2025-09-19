// Simple test script to verify authentication endpoints
const testAuth = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing authentication endpoints...\n');
  
  // Test 1: NextAuth configuration
  console.log('1. Testing NextAuth configuration...');
  try {
    const authResponse = await fetch(`${baseUrl}/api/auth/providers`);
    const authData = await authResponse.json();
    console.log('Available auth providers:', Object.keys(authData));
    
    if (authData.google) {
      console.log('✅ Google provider is configured');
      console.log('Google provider details:', {
        id: authData.google.id,
        name: authData.google.name,
        type: authData.google.type,
        signinUrl: authData.google.signinUrl,
        callbackUrl: authData.google.callbackUrl
      });
    } else {
      console.log('❌ Google provider is NOT configured');
      console.log('Available providers:', Object.keys(authData));
    }
  } catch (error) {
    console.log('❌ Auth config error:', error.message);
  }
  
  // Test 2: Check environment variables (this will only work in dev environment)
  console.log('\n2. Checking environment configuration...');
  console.log('Note: Environment variables should be set in .env or .env.local');
  console.log('Required variables:');
  console.log('- GOOGLE_CLIENT_ID');
  console.log('- GOOGLE_CLIENT_SECRET');
  console.log('- NEXTAUTH_URL');
  console.log('- NEXTAUTH_SECRET');
  
  console.log('\n3. Testing session endpoint...');
  try {
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`);
    const sessionData = await sessionResponse.json();
    console.log('Current session:', sessionData);
  } catch (error) {
    console.log('Session endpoint error:', error.message);
  }
  
  console.log('\nAuthentication test completed!');
  console.log('\nIf Google provider is not showing up, please check:');
  console.log('1. Environment variables are properly set');
  console.log('2. Development server is restarted after env changes');
  console.log('3. Google OAuth credentials are valid in Google Cloud Console');
  console.log('4. Redirect URIs are properly configured in Google Cloud Console');
};

testAuth();
