import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📅 Creating sample training schedule with instructor...');

  // Get the first training program
  const trainingProgram = await prisma.trainingProgram.findFirst();
  if (!trainingProgram) {
    console.log('❌ No training program found');
    return;
  }

  console.log(`Found training program: ${trainingProgram.name} (ID: ${trainingProgram.id})`);

  // Get Vikrant Rai instructor
  const instructor = await prisma.instructor.findUnique({
    where: { name: 'Vikrant Rai' }
  });

  if (!instructor) {
    console.log('❌ Instructor Vikrant Rai not found');
    return;
  }

  console.log(`Found instructor: ${instructor.name} (ID: ${instructor.id})`);

  // Create a sample training schedule
  const schedule = await prisma.trainingSchedule.create({
    data: {
      dayNumber: 1,
      date: new Date('2024-01-15'),
      title: 'Introduction to Oyster Mushroom Cultivation',
      description: 'Learn the basics of oyster mushroom cultivation including substrate preparation and spawn inoculation.',
      topics: ['Introduction to Oyster Mushrooms', 'Substrate Preparation', 'Spawn Inoculation'],
      practicalSessions: [
        {
          title: 'Substrate Preparation',
          duration: 120,
          description: 'Hands-on preparation of substrate for oyster mushroom cultivation'
        }
      ],
      theoreticalSessions: [
        {
          title: 'Mushroom Biology',
          duration: 60,
          description: 'Understanding the biology and life cycle of oyster mushrooms'
        }
      ],
      learningObjectives: [
        'Understand the basics of oyster mushroom cultivation',
        'Learn proper substrate preparation techniques',
        'Master spawn inoculation methods'
      ],
      materials: ['Substrate materials', 'Spawn', 'Sterilization equipment', 'Growing bags'],
      startTime: '09:00',
      endTime: '17:00',
      instructorId: instructor.id,
      trainingProgramId: trainingProgram.id,
      isActive: true
    }
  });

  console.log(`✅ Created training schedule: ${schedule.title} (ID: ${schedule.id})`);
  console.log(`   Instructor: ${instructor.name}`);
  console.log(`   Date: ${schedule.date}`);
  console.log(`   Time: ${schedule.startTime} - ${schedule.endTime}`);
}

main()
  .catch((e) => {
    console.error('❌ Error creating sample schedule:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
