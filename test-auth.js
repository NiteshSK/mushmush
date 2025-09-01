// Simple test script to verify authentication endpoints
const testAuth = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing authentication endpoints...\n');
  
  // Test 1: Registration endpoint
  console.log('1. Testing user registration...');
  try {
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User'
      }),
    });
    
    const registerData = await registerResponse.json();
    console.log('Registration response:', registerData);
  } catch (error) {
    console.log('Registration error:', error.message);
  }
  
  // Test 2: NextAuth configuration
  console.log('\n2. Testing NextAuth configuration...');
  try {
    const authResponse = await fetch(`${baseUrl}/api/auth/providers`);
    const authData = await authResponse.json();
    console.log('Available auth providers:', Object.keys(authData));
  } catch (error) {
    console.log('Auth config error:', error.message);
  }
  
  console.log('\nAuthentication test completed!');
};

testAuth();
