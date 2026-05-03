import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Renaming mushroom categories...');

  const renames = [
    { slug: 'edible', newTitle: 'Edible Mushrooms' },
    { slug: 'medicinal', newTitle: 'Medicinal Mushrooms' },
  ];

  for (const { slug, newTitle } of renames) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing) {
      console.log(`  - No category with slug "${slug}" found, skipping`);
      continue;
    }
    if (existing.title === newTitle) {
      console.log(`  - "${slug}" already named "${newTitle}", skipping`);
      continue;
    }
    await prisma.category.update({
      where: { slug },
      data: { title: newTitle },
    });
    console.log(`  ✓ Renamed "${existing.title}" → "${newTitle}"`);
  }

  console.log('Done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
