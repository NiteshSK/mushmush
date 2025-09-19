import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

async function regeneratePrismaClient() {
  try {
    console.log('🔄 Regenerating Prisma client...');
    
    // Check if we're in the right directory
    const packageJsonPath = join(process.cwd(), 'package.json');
    if (!existsSync(packageJsonPath)) {
      console.log('Changing to project root directory...');
      process.chdir('/Users/kataria/projects/mushmush-website');
    }
    
    // Generate Prisma client
    console.log('Running: npx prisma generate');
    const output = execSync('npx prisma generate', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('✅ Prisma client regenerated successfully!');
    console.log('Output:', output);
    
    // Now test the benefits script
    console.log('🧪 Testing benefits script...');
    const testOutput = execSync('npx tsx scripts/add-benefits-to-product.ts', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('✅ Benefits script test completed!');
    console.log('Test output:', testOutput);
    
  } catch (error) {
    console.error('❌ Error regenerating Prisma client:');
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

regeneratePrismaClient();
