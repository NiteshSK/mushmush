
import { prisma } from "@/lib/prisma";

async function testContext() {
    try {
        const searchTerms = "mushroom";
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.mushmush.in";

        const [products] = await Promise.all([
            prisma.product.findMany({
                where: {
                    OR: [
                        { title: { contains: searchTerms, mode: "insensitive" } },
                        { description: { contains: searchTerms, mode: "insensitive" } },
                    ],
                },
                take: 2,
            }),
        ]);

        console.log("--- Products Context Fragment with Absolute URLs ---");
        console.log(products.map(p => `- ${p.title}
  Link: ${baseUrl}/shop-details/${p.slug}
  Status: ${p.inStock ? 'Available' : 'Out of Stock'}`).join("\n"));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testContext();
