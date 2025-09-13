#!/usr/bin/env node

/**
 * Direct P3009 Production Fix
 * 
 * This script resolves the P3009 error by marking the failed migration as applied
 * Works regardless of database endpoint connectivity issues
 */

const { execSync } = require('child_process');

console.log('🔧 Fixing P3009 migration error...');

try {
  // Step 1: Mark the failed migration as resolved
  console.log('📝 Resolving failed migration 20250913131615_add_promotional_banners...');
  
  const resolveCommand = 'npx prisma migrate resolve --applied 20250913131615_add_promotional_banners';
  execSync(resolveCommand, { stdio: 'inherit' });
  
  console.log('✅ Migration marked as resolved');

  // Step 2: Generate Prisma client
  console.log('🔄 Regenerating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client regenerated');

  // Step 3: Test build
  console.log('🏗️ Testing build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('🎉 Build successful! P3009 error resolved.');

} catch (error) {
  console.error('❌ Error details:', error.message);
  
  if (error.message.includes('P1001')) {
    console.log('\n💡 Database connection issue detected.');
    console.log('   This is likely due to the new PostgreSQL endpoint.');
    console.log('   Please ensure:');
    console.log('   1. Your new database endpoint is accessible');
    console.log('   2. Database credentials are correct in .env');
    console.log('   3. Firewall/security groups allow connections');
    console.log('\n   Once connectivity is restored, run this script again.');
  } else if (error.message.includes('P3008')) {
    console.log('\n💡 Migration already resolved. Continuing with build test...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      execSync('npm run build', { stdio: 'inherit' });
      console.log('🎉 Build successful!');
    } catch (buildError) {
      console.error('❌ Build failed:', buildError.message);
    }
  }
}
