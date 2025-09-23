import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyEarlyBirdPricing() {
  try {
    console.log('🔍 Verifying Early Bird pricing configuration...');

    // Get all training programs
    const trainingPrograms = await prisma.trainingProgram.findMany({
      orderBy: { type: 'asc' }
    });

    console.log(`\n📊 Found ${trainingPrograms.length} training programs:`);

    let earlyBirdCount = 0;
    let regularCount = 0;

    trainingPrograms.forEach((program, index) => {
      console.log(`\n${index + 1}. ${program.name} (${program.type})`);
      console.log(`   Current Price: ₹${program.price.toLocaleString()}`);
      console.log(`   Active: ${program.isActive}`);
      
      if (program.hasEarlyBirdOffer) {
        earlyBirdCount++;
        console.log(`   🎟️ Early Bird Offer: YES`);
        console.log(`   Early Bird Price: ₹${program.earlyBirdPrice?.toLocaleString()}`);
        console.log(`   Original Price: ₹${program.originalPrice?.toLocaleString()}`);
        console.log(`   Savings: ₹${((program.originalPrice || 0) - (program.earlyBirdPrice || 0)).toLocaleString()}`);
        console.log(`   End Date: ${program.earlyBirdEndDate?.toLocaleDateString()}`);
        
        // Check if Early Bird price is lower than original price
        if (program.earlyBirdPrice && program.originalPrice && program.earlyBirdPrice >= program.originalPrice) {
          console.log(`   ⚠️  WARNING: Early Bird price (₹${program.earlyBirdPrice}) is not lower than original price (₹${program.originalPrice})`);
        }
        
        // Check if end date is in the future
        if (program.earlyBirdEndDate && program.earlyBirdEndDate <= new Date()) {
          console.log(`   ⚠️  WARNING: Early Bird offer has expired (End Date: ${program.earlyBirdEndDate.toLocaleDateString()})`);
        }
      } else {
        regularCount++;
        console.log(`   Early Bird Offer: NO`);
      }
    });

    console.log(`\n📈 Summary:`);
    console.log(`   Programs with Early Bird: ${earlyBirdCount}`);
    console.log(`   Regular programs: ${regularCount}`);
    console.log(`   Total programs: ${trainingPrograms.length}`);

    // Test API endpoint
    console.log(`\n🌐 Testing API endpoint...`);
    try {
      const response = await fetch('http://localhost:3000/api/training-programs');
      if (response.ok) {
        const apiPrograms = await response.json();
        console.log(`✅ API endpoint returned ${apiPrograms.length} programs`);
        
        // Check if API response includes Early Bird fields
        const firstProgram = apiPrograms[0];
        const hasEarlyBirdFields = 'hasEarlyBirdOffer' in firstProgram && 
                                  'earlyBirdPrice' in firstProgram && 
                                  'originalPrice' in firstProgram && 
                                  'earlyBirdEndDate' in firstProgram;
        
        if (hasEarlyBirdFields) {
          console.log('✅ API response includes Early Bird pricing fields');
        } else {
          console.log('❌ API response missing Early Bird pricing fields');
          console.log('Available fields:', Object.keys(firstProgram));
        }
      } else {
        console.log(`❌ API endpoint failed with status: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Could not test API endpoint (server may not be running)');
    }

  } catch (error) {
    console.error('❌ Error verifying Early Bird pricing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  verifyEarlyBirdPricing()
    .catch((error) => {
      console.error('❌ Verification failed:', error);
      process.exit(1);
    });
}

export { verifyEarlyBirdPricing };
