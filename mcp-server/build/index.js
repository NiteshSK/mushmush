import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const server = new Server({
    name: "mushmush-knowledge-hub",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
        resources: {},
    },
});
/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_product_info",
                description: "Get detailed information about mushroom products including benefits and usage",
                inputSchema: {
                    type: "object",
                    properties: {
                        slug: {
                            type: "string",
                            description: "The product slug (e.g., 'lions-mane-extract')",
                        },
                    },
                    required: ["slug"],
                },
            },
            {
                name: "get_training_details",
                description: "Get information about upcoming training programs and schedules",
                inputSchema: {
                    type: "object",
                    properties: {
                        slug: {
                            type: "string",
                            description: "The training program slug (e.g., 'oyster-mushroom-cultivation')",
                        },
                    },
                },
            },
            {
                name: "search_knowledge_base",
                description: "Search blog posts and news for mushroom-related topics",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The search query",
                        },
                    },
                    required: ["query"],
                },
            },
            {
                name: "get_trending_and_new",
                description: "Get new arrivals, featured products, and latest news from Mushmush",
                inputSchema: {
                    type: "object",
                    properties: {
                        limit: {
                            type: "number",
                            description: "Number of items to return per category (default 5)",
                        },
                    },
                },
            },
        ],
    };
});
import { ListResourcesRequestSchema, ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";
/**
 * List available resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: "mushmush://catalog/summary",
                name: "Mushmush Catalog Summary",
                description: "An overview of the entire product catalog, categories, and training programs count",
                mimeType: "text/plain",
            },
        ],
    };
});
/**
 * Read a resource
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    if (uri === "mushmush://catalog/summary") {
        const [productCount, categoryCount, trainingCount, categories] = await Promise.all([
            prisma.product.count(),
            prisma.category.count(),
            prisma.trainingProgram.count(),
            prisma.category.findMany({ select: { title: true } }),
        ]);
        const content = `Mushmush Catalog Overview:
- Total Products: ${productCount}
- Total Categories: ${categoryCount} (${categories.map(c => c.title).join(", ")})
- Active Training Programs: ${trainingCount}

This summary is updated live from the database.`;
        return {
            contents: [
                {
                    uri,
                    mimeType: "text/plain",
                    text: content,
                },
            ],
        };
    }
    throw new Error(`Resource not found: ${uri}`);
});
/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        if (name === "get_product_info") {
            const { slug } = args;
            const product = await prisma.product.findUnique({
                where: { slug },
                include: {
                    categories: {
                        include: { category: true }
                    }
                }
            });
            if (!product) {
                return {
                    content: [{ type: "text", text: `Product with slug "${slug}" not found.` }],
                    isError: true,
                };
            }
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(product, null, 2),
                    },
                ],
            };
        }
        if (name === "get_training_details") {
            const { slug } = args;
            if (slug) {
                const program = await prisma.trainingProgram.findUnique({
                    where: { slug },
                    include: {
                        schedules: {
                            orderBy: { dayNumber: 'asc' }
                        }
                    }
                });
                if (!program) {
                    return {
                        content: [{ type: "text", text: `Training program with slug "${slug}" not found.` }],
                        isError: true,
                    };
                }
                return {
                    content: [{ type: "text", text: JSON.stringify(program, null, 2) }],
                };
            }
            else {
                const programs = await prisma.trainingProgram.findMany({
                    where: { isActive: true },
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(programs, null, 2) }],
                };
            }
        }
        if (name === "search_knowledge_base") {
            const { query } = args;
            const [posts, news] = await Promise.all([
                prisma.blogPost.findMany({
                    where: {
                        OR: [
                            { title: { contains: query, mode: "insensitive" } },
                            { content: { contains: query, mode: "insensitive" } },
                        ],
                        published: true,
                    },
                    take: 5,
                }),
                prisma.news.findMany({
                    where: {
                        OR: [
                            { title: { contains: query, mode: "insensitive" } },
                            { content: { contains: query, mode: "insensitive" } },
                        ],
                        published: true,
                    },
                    take: 5,
                }),
            ]);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({ posts, news }, null, 2),
                    },
                ],
            };
        }
        if (name === "get_trending_and_new") {
            const limit = args.limit || 5;
            const [newProducts, featuredProducts, latestNews, activeBanners] = await Promise.all([
                prisma.product.findMany({
                    orderBy: { createdAt: "desc" },
                    take: limit,
                }),
                prisma.product.findMany({
                    where: { featured: true },
                    take: limit,
                }),
                prisma.news.findMany({
                    where: { published: true },
                    orderBy: { createdAt: "desc" },
                    take: limit,
                }),
                prisma.promotionalBanner.findMany({
                    where: { isActive: true },
                    orderBy: { priority: "desc" },
                    take: 3,
                }),
            ]);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            newArrivals: newProducts,
                            trending: featuredProducts,
                            latestNews,
                            activePromotions: activeBanners,
                        }, null, 2),
                    },
                ],
            };
        }
        throw new Error(`Unknown tool: ${name}`);
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});
/**
 * Start the server
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Mushmush Knowledge Hub MCP server running on stdio");
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
