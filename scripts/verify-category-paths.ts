import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCategoryPaths() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        slug: 'asc'
      },
      select: {
        slug: true,
        path: true,
        title: true
      }
    });

    console.log('Category Paths Verification:');
    console.log('==========================');
    
    categories.forEach(category => {
      console.log(`${category.title} (${category.slug}): ${category.path}`);
    });

    const correctPaths = categories.filter(cat => 
      cat.path === '/shop' || cat.path.startsWith('/shop?category=')
    );

    console.log(`\nSummary:`);
    console.log(`Total categories: ${categories.length}`);
    console.log(`Categories with correct paths: ${correctPaths.length}`);
    
    if (correctPaths.length === categories.length) {
      console.log('✅ All category paths are correct!');
    } else {
      console.log('❌ Some category paths need attention');
    }

  } catch (error) {
    console.error('Error verifying category paths:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCategoryPaths();
