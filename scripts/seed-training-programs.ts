import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const trainingPrograms = [
  {
    name: "Oyster Mushroom Cultivation Training",
    slug: "oyster-mushroom-cultivation-training",
    description: "Learn the complete process of oyster mushroom cultivation from substrate preparation to harvesting. This comprehensive program covers both theoretical knowledge and hands-on practical experience with oyster mushroom farming techniques.",
    price: 3000,
    duration: 5,
    dailyHours: "5-6 hours",
    type: "OYSTER" as const,
    isActive: true,
  },
  {
    name: "Button Mushroom Cultivation Training",
    slug: "button-mushroom-cultivation-training", 
    description: "Master the art of button mushroom cultivation with our intensive 10-day program. Learn advanced techniques for substrate preparation, spawn production, and optimal growing conditions for maximum yield.",
    price: 4000,
    duration: 10,
    dailyHours: "5-6 hours",
    type: "BUTTON" as const,
    isActive: true,
  },
  {
    name: "Shiitake Mushroom Cultivation Training",
    slug: "shiitake-mushroom-cultivation-training",
    description: "Discover the secrets of shiitake mushroom cultivation in this comprehensive 14-day program. Learn specialized techniques for log cultivation, bag cultivation, and the unique requirements of shiitake production.",
    price: 6000,
    duration: 14,
    dailyHours: "5-6 hours", 
    type: "SHIITAKE" as const,
    isActive: true,
  },
  {
    name: "Ganoderma (Reishi) Mushroom Cultivation Training",
    slug: "ganoderma-reishi-mushroom-cultivation-training",
    description: "Learn the advanced techniques required for cultivating Ganoderma (Reishi) mushrooms, known for their medicinal properties. This intensive 14-day program covers specialized growing conditions and processing methods.",
    price: 7000,
    duration: 14,
    dailyHours: "5-6 hours",
    type: "GANODERMA" as const,
    isActive: true,
  },
];

async function seedTrainingPrograms() {
  console.log('🌱 Seeding training programs...');

  try {
    // Clear existing training programs
    await prisma.trainingProgram.deleteMany({});
    console.log('✅ Cleared existing training programs');

    // Create new training programs
    for (const program of trainingPrograms) {
      const created = await prisma.trainingProgram.create({
        data: program,
      });
      console.log(`✅ Created training program: ${created.name}`);
    }

    console.log('🎉 Training programs seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding training programs:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedTrainingPrograms();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
main();

export { seedTrainingPrograms };
