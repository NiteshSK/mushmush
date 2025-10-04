import { PrismaClient } from '@prisma/client';
import { pathToFileURL } from 'url';

const prisma = new PrismaClient();
const INSTRUCTOR_ID = 1;

// ... (your 'trainingSchedules' array remains the same)
const trainingSchedules = [
  {
    programSlug: 'oyster-mushroom-cultivation-training',
    schedules: [
      {
        dayNumber: 1,
        title: 'Introduction to Mushroom Cultivation',
        description: 'An introductory session covering the fundamentals of mushroom biology and the oyster mushroom market.',
        practicalSessions: [],
        theoreticalSessions: [],
        date: new Date('2025-11-01'),
        startTime: '10:00',
        endTime: '16:00',
        topics: [ 'Overview of mushroom cultivation', 'Types of edible mushrooms', 'Oyster mushroom varieties', 'Market potential and economics' ],
        materials: [ 'Notebook and pen', 'Lab coat', 'Face mask', 'Hand sanitizer' ],
        learningObjectives: [ 'Understand the basics of mushroom biology', 'Learn about different oyster mushroom strains', 'Identify market opportunities' ]
      },
      // ... include all other schedule objects here
       {
        dayNumber: 2,
        title: 'Substrate Preparation',
        description: 'A hands-on session on preparing and pasteurizing various substrates for optimal growth.',
        practicalSessions: [],
        theoreticalSessions: [],
        date: new Date('2025-11-02'),
        startTime: '10:00',
        endTime: '16:00',
        topics: [ 'Types of substrates', 'Pasteurization techniques', 'Substrate formulation', 'Moisture content management' ],
        materials: [ 'Straw/wheat bran', 'Lime', 'Plastic bags', 'Measuring scale' ],
        learningObjectives: [ 'Prepare different substrate mixtures', 'Understand pasteurization methods', 'Measure and adjust moisture content' ]
      },
      {
        dayNumber: 3,
        title: 'Spawn Production & Inoculation',
        description: 'Learn the sterile techniques required for producing and handling spawn, and inoculating substrate.',
        practicalSessions: [],
        theoreticalSessions: [],
        date: new Date('2025-11-03'),
        startTime: '10:00',
        endTime: '16:00',
        topics: [ 'Spawn preparation', 'Inoculation techniques', 'Hygiene practices', 'Incubation conditions' ],
        materials: [ 'Spawn', 'Inoculation loop', 'Alcohol lamp', 'Sterile gloves' ],
        learningObjectives: [ 'Prepare and handle spawn', 'Perform proper inoculation', 'Maintain sterile conditions', 'Set up incubation environment' ]
      },
      {
        dayNumber: 4,
        title: 'Growing Room Setup & Management',
        description: 'A session focused on setting up and managing the ideal environmental conditions for fruiting.',
        practicalSessions: [],
        theoreticalSessions: [],
        date: new Date('2025-11-04'),
        startTime: '10:00',
        endTime: '16:00',
        topics: [ 'Environmental control', 'Humidity management', 'Light requirements', 'Ventilation systems' ],
        materials: [ 'Hygrometer', 'Thermometer', 'Humidifier', 'Grow lights' ],
        learningObjectives: [ 'Set up a growing room', 'Monitor and adjust environmental conditions', 'Troubleshoot common issues' ]
      },
      {
        dayNumber: 5,
        title: 'Harvesting & Post-Harvest Handling',
        description: 'Learn the best practices for harvesting, packaging, storing, and marketing your mushrooms.',
        practicalSessions: [],
        theoreticalSessions: [],
        date: new Date('2025-11-05'),
        startTime: '10:00',
        endTime: '16:00',
        topics: [ 'Harvesting techniques', 'Grading and packaging', 'Storage methods', 'Marketing strategies' ],
        materials: [ 'Harvesting knife', 'Packaging materials', 'Weighing scale', 'Storage containers' ],
        learningObjectives: [ 'Harvest mushrooms at optimal time', 'Grade and package for market', 'Extend shelf life', 'Develop marketing strategies' ]
      }
    ]
  },
];


async function seedTrainingSchedules() {
  console.log('🌱 Seeding training schedules...');

  try {
    // --- FIX IS HERE ---
    // Ensure the instructor we want to connect to actually exists.
    console.log(`Ensuring instructor with ID ${INSTRUCTOR_ID} exists...`);
    await prisma.instructor.upsert({
      where: { id: INSTRUCTOR_ID },
      update: {}, // Don't update if they exist
      create: {
        id: INSTRUCTOR_ID, // Manually set the ID for predictability
        name: 'Dr. Evelyn Reed', // Example data
        bio: 'A leading expert in mycology with over 15 years of experience.', // Example data
        // NOTE: You may need to add other required fields from your Instructor model here
      },
    });
    console.log(`✅ Instructor with ID ${INSTRUCTOR_ID} is ready.`);
    // --- END FIX ---


    for (const programData of trainingSchedules) {
      const program = await prisma.trainingProgram.findUnique({
        where: { slug: programData.programSlug },
      });

      if (!program) {
        console.warn(`❌ Program not found: ${programData.programSlug}`);
        continue;
      }

      await prisma.trainingSchedule.deleteMany({
        where: { trainingProgramId: program.id },
      });

      for (const scheduleData of programData.schedules) {
        await prisma.trainingSchedule.create({
          data: {
            dayNumber: scheduleData.dayNumber,
            title: scheduleData.title,
            description: scheduleData.description,
            date: scheduleData.date,
            startTime: scheduleData.startTime,
            endTime: scheduleData.endTime,
            topics: { set: scheduleData.topics },
            materials: { set: scheduleData.materials },
            learningObjectives: { set: scheduleData.learningObjectives },
            practicalSessions: { set: scheduleData.practicalSessions },
            theoreticalSessions: { set: scheduleData.theoreticalSessions },
            trainingProgram: {
              connect: { id: program.id }
            },
            instructor: {
              connect: {
                id: INSTRUCTOR_ID
              }
            }
          },
        });
        console.log(`✅ Created schedule for day ${scheduleData.dayNumber} of ${program.name}`);
      }
    }

    console.log('🎉 Training schedules seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding training schedules:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedTrainingSchedules();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
const isMainModule = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMainModule) {
  main();
}


export { seedTrainingSchedules };