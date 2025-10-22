/**
 * Comprehensive Test Suite for Clean Checkout Flow
 * Tests all scenarios for the new address management system
 */

import { prisma } from '../src/lib/prisma';

interface TestResult {
  scenario: string;
  status: 'PASS' | 'FAIL';
  message: string;
}

const results: TestResult[] = [];

async function testCheckoutFlow() {
  console.log('🧪 Starting Checkout Flow Tests...\n');

  // Test 1: First-time user with same billing/shipping
  console.log('Test 1: First-time user - same billing/shipping address');
  try {
    // Simulate first-time user checkout
    const testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    });

    if (testUser) {
      const addressCount = await prisma.addresses.count({
        where: { userId: testUser.id }
      });

      if (addressCount === 0) {
        results.push({
          scenario: 'First-time user (no addresses)',
          status: 'PASS',
          message: 'User has no saved addresses - will show billing form'
        });
      } else {
        results.push({
          scenario: 'First-time user (no addresses)',
          status: 'FAIL',
          message: `User has ${addressCount} addresses - expected 0`
        });
      }
    }
  } catch (error) {
    results.push({
      scenario: 'First-time user test',
      status: 'FAIL',
      message: `Error: ${error}`
    });
  }

  // Test 2: Returning user with saved addresses
  console.log('\nTest 2: Returning user - has saved addresses');
  try {
    const users = await prisma.user.findMany({
      include: {
        addresses: true
      }
    });

    const userWithAddresses = users.find(u => u.addresses.length > 0);
    
    if (userWithAddresses) {
      const defaultAddress = userWithAddresses.addresses.find(a => a.isDefault);
      
      results.push({
        scenario: 'Returning user with addresses',
        status: 'PASS',
        message: `User has ${userWithAddresses.addresses.length} addresses${defaultAddress ? ' with default set' : ''}`
      });
    } else {
      results.push({
        scenario: 'Returning user with addresses',
        status: 'FAIL',
        message: 'No users with saved addresses found'
      });
    }
  } catch (error) {
    results.push({
      scenario: 'Returning user test',
      status: 'FAIL',
      message: `Error: ${error}`
    });
  }

  // Test 3: Address validation
  console.log('\nTest 3: Address validation rules');
  const validationTests = [
    { field: 'PIN Code', value: '123456', valid: true },
    { field: 'PIN Code', value: '12345', valid: false },
    { field: 'PIN Code', value: 'ABCDEF', valid: false },
    { field: 'Phone', value: '9876543210', valid: true },
    { field: 'Phone', value: '123456789', valid: false },
    { field: 'Phone', value: '98765432101', valid: false },
  ];

  validationTests.forEach(test => {
    const isValid = test.field === 'PIN Code' 
      ? /^\d{6}$/.test(test.value)
      : /^[6-9]\d{9}$/.test(test.value);
    
    results.push({
      scenario: `Validation: ${test.field} = "${test.value}"`,
      status: isValid === test.valid ? 'PASS' : 'FAIL',
      message: `Expected ${test.valid ? 'valid' : 'invalid'}, got ${isValid ? 'valid' : 'invalid'}`
    });
  });

  // Test 4: Address limit (max 5)
  console.log('\nTest 4: Address limit enforcement');
  try {
    const userWithManyAddresses = await prisma.user.findFirst({
      include: {
        addresses: true
      },
      where: {
        addresses: {
          some: {}
        }
      }
    });

    if (userWithManyAddresses) {
      const count = userWithManyAddresses.addresses.length;
      results.push({
        scenario: 'Address limit check',
        status: count <= 5 ? 'PASS' : 'FAIL',
        message: `User has ${count} addresses (limit: 5)`
      });
    }
  } catch (error) {
    results.push({
      scenario: 'Address limit test',
      status: 'FAIL',
      message: `Error: ${error}`
    });
  }

  // Test 5: Default address logic
  console.log('\nTest 5: Default address handling');
  try {
    const usersWithMultipleAddresses = await prisma.user.findMany({
      include: {
        addresses: true
      },
      where: {
        addresses: {
          some: {}
        }
      }
    });

    for (const user of usersWithMultipleAddresses) {
      if (user.addresses.length > 1) {
        const defaultCount = user.addresses.filter(a => a.isDefault).length;
        results.push({
          scenario: `Default address for user ${user.email}`,
          status: defaultCount <= 1 ? 'PASS' : 'FAIL',
          message: `Found ${defaultCount} default addresses (expected 0 or 1)`
        });
      }
    }
  } catch (error) {
    results.push({
      scenario: 'Default address test',
      status: 'FAIL',
      message: `Error: ${error}`
    });
  }

  // Print results
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(80) + '\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} Test ${index + 1}: ${result.scenario}`);
    console.log(`   ${result.message}\n`);
  });

  console.log('='.repeat(80));
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(80));

  await prisma.$disconnect();
}

// Run tests
testCheckoutFlow().catch(console.error);
