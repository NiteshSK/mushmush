import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addEarlyBirdPricing() {
  try {
    console.log('🎟️ Adding Early Bird pricing to training programs...');

    // Update Oyster Mushroom Training
    const oysterProgram = await prisma.trainingProgram.updateMany({
      where: { type: 'OYSTER' },
      data: {
        hasEarlyBirdOffer: true,
        earlyBirdPrice: 3999,
        originalPrice: 5000,
        earlyBirdEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    });

    console.log(`✅ Updated ${oysterProgram.count} Oyster Mushroom Training programs`);

    // Update Shiitake Mushroom Training
    const shiitakeProgram = await prisma.trainingProgram.updateMany({
      where: { type: 'SHIITAKE' },
      data: {
        hasEarlyBirdOffer: true,
        earlyBirdPrice: 6999,
        originalPrice: 8000,
        earlyBirdEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    });

    console.log(`✅ Updated ${shiitakeProgram.count} Shiitake Mushroom Training programs`);

    // Display all training programs with their pricing
    const allPrograms = await prisma.trainingProgram.findMany({
      orderBy: { type: 'asc' }
    });

    console.log('\n📊 All Training Programs with Pricing:');
    allPrograms.forEach((program, index) => {
      console.log(`\n${index + 1}. ${program.name} (${program.type})`);
      console.log(`   Current Price: ₹${program.price.toLocaleString()}`);
      console.log(`   Early Bird Offer: ${program.hasEarlyBirdOffer ? 'Yes' : 'No'}`);
      if (program.hasEarlyBirdOffer) {
        console.log(`   Original Price: ₹${program.originalPrice?.toLocaleString()}`);
        console.log(`   Early Bird Price: ₹${program.earlyBirdPrice?.toLocaleString()}`);
        console.log(`   Savings: ₹${((program.originalPrice || 0) - (program.earlyBirdPrice || 0)).toLocaleString()}`);
        console.log(`   Offer Ends: ${program.earlyBirdEndDate?.toLocaleDateString()}`);
      }
    });

    console.log('\n🎉 Early Bird pricing added successfully!');

  } catch (error) {
    console.error('❌ Error adding Early Bird pricing:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  addEarlyBirdPricing()
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { addEarlyBirdPricing };
