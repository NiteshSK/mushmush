/**
 * Sets a default quantity for all products that have quantity = 0 and inStock = true.
 * Run with: npx tsx scripts/set-default-quantity.ts
 *
 * For production: DATABASE_URL="your_prod_url" npx tsx scripts/set-default-quantity.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find all in-stock products with 0 quantity
  const products = await prisma.product.findMany({
    where: {
      inStock: true,
      quantity: 0,
    },
    select: {
      id: true,
      title: true,
      quantity: true,
      measurementValue: true,
      measurementType: true,
    },
  });

  console.log(`Found ${products.length} in-stock products with quantity = 0:\n`);

  if (products.length === 0) {
    console.log('All products already have quantity set. Nothing to do.');
    return;
  }

  for (const p of products) {
    // Default: 10 packs worth of quantity
    // e.g., if measurementValue=100 (grams), set quantity to 1000 (grams) = 10 packs
    const defaultQuantity = (p.measurementValue || 100) * 10;

    console.log(`  ${p.title}: ${p.measurementValue}${p.measurementType} → setting quantity to ${defaultQuantity}${p.measurementType}`);

    await prisma.product.update({
      where: { id: p.id },
      data: { quantity: defaultQuantity },
    });
  }

  console.log(`\n✅ Updated ${products.length} products with default quantity.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
