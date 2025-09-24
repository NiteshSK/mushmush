import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking Site Settings...');
  console.log('===========================');

  try {
    // Check if SiteSettings table exists and get current settings
    const settings = await prisma.$queryRaw`
      SELECT * FROM site_settings LIMIT 1
    ` as any[];

    if (settings.length === 0) {
      console.log('❌ No site settings found in database');
      console.log('📝 Run "npm run setup:festive-effects" to set up the system');
      return;
    }

    const currentSettings = settings[0];
    console.log('✅ Site settings found:');
    console.log(`   - ID: ${currentSettings.id}`);
    console.log(`   - Festive Effects: ${currentSettings.enable_festive_effects ? 'ENABLED' : 'DISABLED'}`);
    console.log(`   - Start Date: ${currentSettings.festive_effects_start_date || 'Not set'}`);
    console.log(`   - End Date: ${currentSettings.festive_effects_end_date || 'Not set'}`);
    console.log(`   - Created: ${currentSettings.created_at}`);
    console.log(`   - Updated: ${currentSettings.updated_at}`);

    // Test the API endpoint
    console.log('\n🌐 Testing API endpoint...');
    try {
      const response = await fetch('http://localhost:3000/api/site-settings');
      if (response.ok) {
        const apiData = await response.json();
        console.log('✅ API endpoint working:');
        console.log(`   - enableFestiveEffects: ${apiData.enableFestiveEffects}`);
      } else {
        console.log('❌ API endpoint returned error:', response.status);
      }
    } catch (error) {
      console.log('❌ Could not test API endpoint (server may not be running)');
    }

  } catch (error) {
    console.error('❌ Error checking site settings:', error);
    console.log('📝 Make sure the database is running and SiteSettings table exists');
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  });
