import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding instructors...');

  const instructors = [
    {
      name: 'Vikrant Rai',
      email: 'vikrant.rai@mushmush.com',
      phone: '+91 98765 43210',
      bio: 'Expert in oyster mushroom cultivation with over 8 years of experience in commercial mushroom farming. Specializes in sustainable cultivation techniques and yield optimization.',
      expertise: 'Oyster Mushroom Cultivation, Commercial Farming, Sustainable Agriculture',
      experience: 8,
    },
    {
      name: 'Pravesh Rawat',
      email: 'pravesh.rawat@mushmush.com',
      phone: '+91 98765 43211',
      bio: 'Specialist in button and shiitake mushroom cultivation with 10+ years of experience. Expert in spawn production, substrate preparation, and disease management.',
      expertise: 'Button Mushroom, Shiitake Mushroom, Spawn Production, Disease Management',
      experience: 10,
    },
  ];

  for (const instructor of instructors) {
    try {
      const existingInstructor = await prisma.instructor.findUnique({
        where: { name: instructor.name },
      });

      if (existingInstructor) {
        console.log(`✅ Instructor "${instructor.name}" already exists. Updating...`);
        await prisma.instructor.update({
          where: { name: instructor.name },
          data: instructor,
        });
      } else {
        console.log(`➕ Creating instructor "${instructor.name}"...`);
        await prisma.instructor.create({
          data: instructor,
        });
      }
    } catch (error) {
      console.error(`❌ Error creating instructor "${instructor.name}":`, error);
    }
  }

  console.log('🎉 Instructors seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding instructors:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
