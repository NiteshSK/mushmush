import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const idsToDelete = [23]; // ID of the "Turkey Tail" duplicate

    // First delete related productCategory entries
    await prisma.productCategory.deleteMany({
        where: { productId: { in: idsToDelete } }
    });

    // Then delete the products
    const deleted = await prisma.product.deleteMany({
        where: { id: { in: idsToDelete } }
    });

    console.log(`Deleted ${deleted.count} duplicate product(s).`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
