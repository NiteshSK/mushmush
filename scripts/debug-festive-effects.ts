import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Debugging Festive Effects...');
  console.log('============================');

  try {
    // 1. Check database settings
    console.log('\n📊 1. Checking Database Settings:');
    const settings = await prisma.$queryRaw`
      SELECT * FROM site_settings LIMIT 1
    ` as any[];

    if (settings.length === 0) {
      console.log('❌ No site settings found in database');
      console.log('📝 Run "npm run setup:festive-effects" to set up the system');
    } else {
      const currentSettings = settings[0];
      console.log('✅ Site settings found:');
      console.log(`   - ID: ${currentSettings.id}`);
      console.log(`   - Festive Effects: ${currentSettings.enable_festive_effects ? 'ENABLED' : 'DISABLED'}`);
      console.log(`   - Start Date: ${currentSettings.festive_effects_start_date || 'Not set'}`);
      console.log(`   - End Date: ${currentSettings.festive_effects_end_date || 'Not set'}`);
      console.log(`   - Created: ${currentSettings.created_at}`);
      console.log(`   - Updated: ${currentSettings.updated_at}`);
    }

    // 2. Test API endpoint
    console.log('\n🌐 2. Testing API Endpoint:');
    try {
      const response = await fetch('http://localhost:3000/api/site-settings');
      if (response.ok) {
        const apiData = await response.json();
        console.log('✅ API endpoint working:');
        console.log(`   - enableFestiveEffects: ${apiData.enableFestiveEffects}`);
        console.log(`   - Raw response:`, JSON.stringify(apiData, null, 2));
      } else {
        console.log('❌ API endpoint returned error:', response.status, response.statusText);
        const errorText = await response.text();
        console.log('   - Error response:', errorText);
      }
    } catch (error) {
      console.log('❌ Could not test API endpoint (server may not be running):', error.message);
    }

    // 3. Check if components are using global setting
    console.log('\n🧩 3. Component Analysis:');
    console.log('Home component uses: useGlobalSetting={true} (should respect global setting)');
    console.log('Categories component: ✅ Fixed (removed nested FestiveWrapper)');
    console.log('FAQ component: ✅ Fixed (removed nested FestiveWrapper)');
    console.log('Training component: ⚠️  Has its own FestiveWrapper (not on Home page)');
    console.log('AboutUs component: ⚠️  Has multiple FestiveWrappers (not on Home page)');

    // 4. Check if there might be caching issues
    console.log('\n🔄 4. Potential Issues:');
    console.log('- Browser caching: Try hard refresh (Cmd+Shift+R on Mac)');
    console.log('- API caching: The API might be cached');
    console.log('- Component state: The component might not be re-fetching the setting');
    console.log('- Database connection: The API might not be connecting to database properly');

  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  });
