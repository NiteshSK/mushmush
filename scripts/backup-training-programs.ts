import { PrismaClient, TrainingType } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface TrainingProgramBackup {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration: number;
  dailyHours: string;
  type: TrainingType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TrainingScheduleBackup {
  id: number;
  trainingProgramId: number;
  dayNumber: number;
  date: Date;
  title: string;
  description: string;
  topics: any;
  practicalSessions: any;
  theoreticalSessions: any;
  learningObjectives: any;
  materials: any;
  instructorId?: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TrainingRegistrationBackup {
  id: string;
  registrationNumber: string;
  status: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  participantAddress: any;
  preferredStartDate?: Date;
  specialRequirements?: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentDate?: Date;
  upiTransactionId?: string;
  trainingProgramId: number;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TrainingBackupData {
  trainingPrograms: TrainingProgramBackup[];
  trainingSchedules: TrainingScheduleBackup[];
  trainingRegistrations: TrainingRegistrationBackup[];
  backupDate: string;
  environment: string;
}

async function backupTrainingPrograms() {
  try {
    console.log('🔄 Starting training programs backup from production...');
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Create backups directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `training-programs-backup-${timestamp}.json`);

    console.log(`📦 Creating training programs backup: ${backupFile}`);

    // Fetch training programs
    console.log('📚 Fetching training programs...');
    const trainingPrograms = await prisma.trainingProgram.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Fetch training schedules
    console.log('📅 Fetching training schedules...');
    const trainingSchedules = await prisma.trainingSchedule.findMany({
      orderBy: { date: 'desc' }
    });

    // Fetch training registrations
    console.log('👥 Fetching training registrations...');
    const trainingRegistrations = await prisma.trainingRegistration.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Prepare backup data
    const backupData: TrainingBackupData = {
      trainingPrograms,
      trainingSchedules,
      trainingRegistrations,
      backupDate: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };

    // Write backup to file
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

    console.log('✅ Training programs backup created successfully');
    console.log(`📁 Backup file: ${backupFile}`);
    console.log(`📊 Backup size: ${fs.statSync(backupFile).size} bytes`);

    // Display summary
    console.log('\n📋 Backup Summary:');
    console.log(`   Training Programs: ${trainingPrograms.length}`);
    console.log(`   Training Schedules: ${trainingSchedules.length}`);
    console.log(`   Training Registrations: ${trainingRegistrations.length}`);
    console.log(`   Backup Date: ${backupData.backupDate}`);
    console.log(`   Environment: ${backupData.environment}`);

    // Display training programs details
    console.log('\n🎓 Training Programs Backed Up:');
    trainingPrograms.forEach((program, index) => {
      console.log(`   ${index + 1}. ${program.name} (${program.type}) - ₹${program.price} - ${program.duration} days`);
    });

    // Clean up old training backups (keep only last 5)
    console.log('\n🧹 Cleaning up old training backups...');
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('training-programs-backup-') && file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        stats: fs.statSync(path.join(backupDir, file))
      }))
      .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

    if (files.length > 5) {
      const toDelete = files.slice(5);
      toDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`🗑️  Deleted old backup: ${file.name}`);
      });
    }

    console.log('\n🎉 Training programs backup completed successfully!');
    return backupFile;

  } catch (error) {
    console.error('❌ Training programs backup failed:', error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Function to restore training programs from backup
async function restoreTrainingPrograms(backupFile: string) {
  try {
    console.log(`🔄 Restoring training programs from: ${backupFile}`);
    
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }

    // Read backup data
    const backupContent = fs.readFileSync(backupFile, 'utf8');
    const backupData: TrainingBackupData = JSON.parse(backupContent);

    console.log(`📅 Restoring backup from: ${backupData.backupDate}`);
    console.log(`🌍 Environment: ${backupData.environment}`);

    // Restore training programs
    console.log('🎓 Restoring training programs...');
    for (const program of backupData.trainingPrograms) {
      await prisma.trainingProgram.upsert({
        where: { id: program.id },
        update: {
          name: program.name,
          slug: program.slug,
          description: program.description,
          price: program.price,
          duration: program.duration,
          dailyHours: program.dailyHours,
          type: program.type as TrainingType,
          isActive: program.isActive,
          updatedAt: program.updatedAt
        },
        create: {
          id: program.id,
          name: program.name,
          slug: program.slug,
          description: program.description,
          price: program.price,
          duration: program.duration,
          dailyHours: program.dailyHours,
          type: program.type as TrainingType,
          isActive: program.isActive,
          createdAt: program.createdAt,
          updatedAt: program.updatedAt
        }
      });
    }

    // Restore training schedules
    console.log('📅 Restoring training schedules...');
    for (const schedule of backupData.trainingSchedules) {
      // Check if instructor exists, if not set to null
      let instructorId = schedule.instructorId;
      if (instructorId) {
        const instructorExists = await prisma.instructor.findUnique({
          where: { id: instructorId }
        });
        if (!instructorExists) {
          console.log(`⚠️  Instructor with ID ${instructorId} not found, setting instructorId to null for schedule: ${schedule.title}`);
          instructorId = null;
        }
      }

      await prisma.trainingSchedule.upsert({
        where: { id: schedule.id },
        update: {
          trainingProgramId: schedule.trainingProgramId,
          dayNumber: schedule.dayNumber,
          date: schedule.date,
          title: schedule.title,
          description: schedule.description,
          topics: schedule.topics,
          practicalSessions: schedule.practicalSessions,
          theoreticalSessions: schedule.theoreticalSessions,
          learningObjectives: schedule.learningObjectives,
          materials: schedule.materials,
          instructorId: instructorId,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: schedule.isActive,
          updatedAt: schedule.updatedAt
        },
        create: {
          id: schedule.id,
          trainingProgramId: schedule.trainingProgramId,
          dayNumber: schedule.dayNumber,
          date: schedule.date,
          title: schedule.title,
          description: schedule.description,
          topics: schedule.topics,
          practicalSessions: schedule.practicalSessions,
          theoreticalSessions: schedule.theoreticalSessions,
          learningObjectives: schedule.learningObjectives,
          materials: schedule.materials,
          instructorId: instructorId,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: schedule.isActive,
          createdAt: schedule.createdAt,
          updatedAt: schedule.updatedAt
        }
      });
    }

    // Restore training registrations
    console.log('👥 Restoring training registrations...');
    for (const registration of backupData.trainingRegistrations) {
      // Check if user exists, if not set userId to null
      let userId = registration.userId;
      if (userId) {
        try {
          const userExists = await prisma.user.findUnique({
            where: { id: userId }
          });
          if (!userExists) {
            console.warn(`⚠️  User with ID ${userId} not found, setting userId to null for registration: ${registration.participantName}`);
            userId = null;
          }
        } catch (error) {
          console.warn(`⚠️  Error checking user existence for ID ${userId}, setting userId to null:`, error);
          userId = null;
        }
      }

      await prisma.trainingRegistration.upsert({
        where: { id: registration.id },
        update: {
          registrationNumber: registration.registrationNumber,
          status: registration.status,
          participantName: registration.participantName,
          participantEmail: registration.participantEmail,
          participantPhone: registration.participantPhone,
          participantAddress: registration.participantAddress,
          preferredStartDate: registration.preferredStartDate,
          specialRequirements: registration.specialRequirements,
          totalAmount: registration.totalAmount,
          paymentStatus: registration.paymentStatus,
          paymentMethod: registration.paymentMethod,
          paymentReference: registration.paymentReference,
          paymentDate: registration.paymentDate,
          upiTransactionId: registration.upiTransactionId,
          trainingProgramId: registration.trainingProgramId,
          userId: userId,
          updatedAt: registration.updatedAt
        },
        create: {
          id: registration.id,
          registrationNumber: registration.registrationNumber,
          status: registration.status,
          participantName: registration.participantName,
          participantEmail: registration.participantEmail,
          participantPhone: registration.participantPhone,
          participantAddress: registration.participantAddress,
          preferredStartDate: registration.preferredStartDate,
          specialRequirements: registration.specialRequirements,
          totalAmount: registration.totalAmount,
          paymentStatus: registration.paymentStatus,
          paymentMethod: registration.paymentMethod,
          paymentReference: registration.paymentReference,
          paymentDate: registration.paymentDate,
          upiTransactionId: registration.upiTransactionId,
          trainingProgramId: registration.trainingProgramId,
          userId: userId,
          createdAt: registration.createdAt,
          updatedAt: registration.updatedAt
        }
      });
    }

    console.log('✅ Training programs restore completed successfully!');
    console.log(`📚 Restored ${backupData.trainingPrograms.length} training programs`);
    console.log(`📅 Restored ${backupData.trainingSchedules.length} training schedules`);
    console.log(`👥 Restored ${backupData.trainingRegistrations.length} training registrations`);

  } catch (error) {
    console.error('❌ Training programs restore failed:', error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run backup or restore based on command line arguments
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2] || 'backup';
  
  if (command === 'restore') {
    const backupFile = process.argv[3] || './backups/training-programs-backup-2025-09-23T05-27-10-451Z.json';
    
    restoreTrainingPrograms(backupFile)
      .then(() => {
        console.log(`\n🎉 Training programs restore completed successfully!`);
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Training programs restore process failed:', error.message);
        process.exit(1);
      });
  } else {
    backupTrainingPrograms()
      .then((backupFile) => {
        console.log(`\n📋 Training programs backup completed: ${backupFile}`);
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Training programs backup process failed:', error.message);
        process.exit(1);
      });
  }
}

export { backupTrainingPrograms, restoreTrainingPrograms };
