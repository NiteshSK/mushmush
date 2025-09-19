import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

async function createBenefitsMigration() {
  try {
    console.log('Creating benefits migration using Prisma...');
    
    // Check if we're in the right directory
    const packageJsonPath = join(process.cwd(), 'package.json');
    if (!existsSync(packageJsonPath)) {
      console.log('Changing to project root directory...');
      process.chdir('/Users/kataria/projects/mushmush-website');
    }
    
    // Generate the migration
    console.log('Running: npx prisma migrate dev --name add_benefits_field');
    const output = execSync('npx prisma migrate dev --name add_benefits_field', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('Migration output:');
    console.log(output);
    
  } catch (error) {
    console.error('Error creating migration:');
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    if (typeof error === 'object' && error !== null && 'stdout' in error) {
      console.error('Stdout:', (error as any).stdout?.toString());
    }
    if (typeof error === 'object' && error !== null && 'stderr' in error) {
      console.error('Stderr:', (error as any).stderr?.toString());
    }
  }
}

createBenefitsMigration();
