import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function askPassword(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    
    let password = '';
    
    process.stdin.on('data', (data) => {
      const char = data.toString();
      
      if (char === '\n' || char === '\r' || char === '\u0004') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write('\n');
        resolve(password);
      } else if (char === '\u0003') {
        process.exit();
      } else if (char === '\u007f') {
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else {
        password += char;
        process.stdout.write('*');
      }
    });
  });
}

async function createAdminUser() {
  try {
    console.log('🔧 Interactive Admin User Creation\n');

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      
      const proceed = await askQuestion('\nDo you want to create another admin user? (y/N): ');
      if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
        console.log('Operation cancelled.');
        return;
      }
    }

    // Collect user information
    const name = await askQuestion('Enter admin name: ');
    if (!name) {
      console.log('❌ Name is required');
      return;
    }

    const email = await askQuestion('Enter admin email: ');
    if (!email) {
      console.log('❌ Email is required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format');
      return;
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ User with this email already exists');
      return;
    }

    const password = await askPassword('Enter admin password: ');
    if (!password) {
      console.log('❌ Password is required');
      return;
    }

    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters long');
      return;
    }

    const confirmPassword = await askPassword('Confirm password: ');
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match');
      return;
    }

    // Hash password
    console.log('\n🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      }
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log('\n🔐 You can now sign in to /admin with these credentials');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\nOperation cancelled by user');
  rl.close();
  await prisma.$disconnect();
  process.exit(0);
});

createAdminUser();
