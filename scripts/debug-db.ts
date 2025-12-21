import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Searching for 'Turkey' in products...");
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { title: { contains: "Turkey", mode: "insensitive" } },
                { description: { contains: "Turkey", mode: "insensitive" } },
            ],
        },
    });
    console.log("Matches found:", JSON.stringify(products, null, 2));

    console.log("\nAll product titles:");
    const allProducts = await prisma.product.findMany({
        select: { title: true }
    });
    console.log(allProducts.map(p => p.title));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
