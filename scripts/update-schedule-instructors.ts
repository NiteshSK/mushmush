import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating training schedules with instructor references...');

  // Get all instructors
  const instructors = await prisma.instructor.findMany();
  console.log(`Found ${instructors.length} instructors:`);
  instructors.forEach(i => console.log(`- ${i.name} (ID: ${i.id})`));

  // Get all training schedules
  const schedules = await prisma.trainingSchedule.findMany();
  console.log(`Found ${schedules.length} training schedules to update`);

  for (const schedule of schedules) {
    // Find the best match instructor based on the old instructor name
    let matchedInstructor = null;
    
    if (schedule.instructorId) {
      console.log(`Schedule ${schedule.id} already has instructorId ${schedule.instructorId}, skipping...`);
      continue;
    }

    // Try to match by name (this is a simple heuristic)
    const instructorName = schedule.instructor as string; // Cast to string for comparison
    if (instructorName) {
      if (instructorName.toLowerCase().includes('vikrant')) {
        matchedInstructor = instructors.find(i => i.name === 'Vikrant Rai');
      } else if (instructorName.toLowerCase().includes('pravesh')) {
        matchedInstructor = instructors.find(i => i.name === 'Pravesh Rawat');
      }
    }

    if (matchedInstructor) {
      console.log(`Updating schedule ${schedule.id}: "${schedule.title}" -> ${matchedInstructor.name}`);
      await prisma.trainingSchedule.update({
        where: { id: schedule.id },
        data: { instructorId: matchedInstructor.id }
      });
    } else {
      // Default to Vikrant Rai if no match found
      const defaultInstructor = instructors.find(i => i.name === 'Vikrant Rai');
      if (defaultInstructor) {
        console.log(`No match found for schedule ${schedule.id}, assigning to ${defaultInstructor.name}`);
        await prisma.trainingSchedule.update({
          where: { id: schedule.id },
          data: { instructorId: defaultInstructor.id }
        });
      }
    }
  }

  console.log('✅ Training schedules updated successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error updating training schedules:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
