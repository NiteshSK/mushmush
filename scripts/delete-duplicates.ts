import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const idsToDelete = [21, 22]; // IDs of the duplicates to remove

    // First delete related productCategory entries
    await prisma.productCategory.deleteMany({
        where: { productId: { in: idsToDelete } }
    });

    // Then delete the products
    const deleted = await prisma.product.deleteMany({
        where: { id: { in: idsToDelete } }
    });

    console.log(`Deleted ${deleted.count} duplicate products.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
