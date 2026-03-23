import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, title: true, slug: true }
  });
  
  const titleCount: Record<string, any[]> = {};
  for (const p of products) {
    if (!titleCount[p.title]) titleCount[p.title] = [];
    titleCount[p.title].push(p);
  }
  
  console.log("Duplicate Products:");
  for (const title in titleCount) {
    if (titleCount[title].length > 1) {
      console.log(`- Base Title: "${title}" (${titleCount[title].length} copies)`);
      for (const p of titleCount[title]) {
        console.log(`    ID: ${p.id}, Slug: ${p.slug}`);
      }
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
