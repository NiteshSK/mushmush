const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTrainingData() {
  try {
    console.log('Checking training programs...');
    const trainingPrograms = await prisma.trainingProgram.findMany();
    console.log(`Found ${trainingPrograms.length} training programs:`);
    trainingPrograms.forEach(program => {
      console.log(`- ${program.name} (ID: ${program.id}, Slug: ${program.slug})`);
    });

    console.log('\nChecking training schedules...');
    const trainingSchedules = await prisma.trainingSchedule.findMany();
    console.log(`Found ${trainingSchedules.length} training schedules:`);
    trainingSchedules.forEach(schedule => {
      console.log(`- Day ${schedule.dayNumber}: ${schedule.title} (Program ID: ${schedule.trainingProgramId})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTrainingData();
