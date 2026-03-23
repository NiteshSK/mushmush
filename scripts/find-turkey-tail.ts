import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const products = await prisma.product.findMany({
        where: {
            title: {
                contains: 'Turkey',
                mode: 'insensitive'
            }
        },
        select: { id: true, title: true, slug: true }
    });

    console.log("Found matching products:");
    console.log(JSON.stringify(products, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
