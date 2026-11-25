import { streamText, convertToCoreMessages, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { availablePacks } from "@/lib/inventory";
import { activeDiscountsInclude, computeProductDiscount } from "@/lib/product-pricing";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        // Rate limit: 15 messages per IP per minute
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const rl = rateLimit(`ai-chat:${ip}`, { max: 15, windowSeconds: 60 });
        if (!rl.allowed) {
            return new Response("Too many requests. Please slow down.", { status: 429 });
        }

        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response("Invalid messages", { status: 400 });
        }

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            console.error("DEBUG: GOOGLE_GENERATIVE_AI_API_KEY is missing from environment variables");
            return new Response("Google AI API Key not configured", { status: 500 });
        }

        // Get the last user message for RAG context
        const lastMessage = messages[messages.length - 1];
        let lastUserMessage = "";
        if (lastMessage && lastMessage.role === "user") {
            // In v5, messages use 'parts' instead of 'content'
            lastUserMessage = lastMessage.parts
                ?.filter((p: any) => p.type === "text")
                .map((p: any) => p.text)
                .join(" ") || "";
        }

        // Extract meaningful keywords for DB search
        const stopWords = new Set(['what', 'is', 'the', 'a', 'an', 'of', 'for', 'in', 'on', 'at', 'to', 'do', 'you', 'have', 'any', 'can', 'i', 'get', 'me', 'tell', 'about', 'how', 'much', 'price', 'cost']);
        const keywordList = lastUserMessage
            .toLowerCase()
            .replace(/[?!.,;:'"]/g, '')
            .split(/\s+/)
            .filter((word: string) => word.length > 2 && !stopWords.has(word));

        // Build OR conditions for each keyword (matches any keyword in title or description)
        const buildSearch = (titleField: string, descField: string) => {
            if (keywordList.length === 0) return {};
            return {
                OR: keywordList.flatMap((kw: string) => [
                    { [titleField]: { contains: kw, mode: "insensitive" as const } },
                    { [descField]: { contains: kw, mode: "insensitive" as const } },
                ]),
            };
        };

        // Search for relevant context in the DB — each keyword matched independently
        // Wrapped in try/catch so the chat still works when the DB is temporarily unreachable
        let products: any[] = [];
        let programs: any[] = [];
        let blogs: any[] = [];
        let news: any[] = [];
        let featured: any[] = [];
        let banners: any[] = [];
        let settings: any[] = [];

        try {
            [products, programs, blogs, news, featured, banners] = await Promise.all([
                keywordList.length > 0
                    ? prisma.product.findMany({ where: { ...buildSearch('title', 'description'), archivedAt:null }, take: 5 })
                    : prisma.product.findMany({ where:{archivedAt:null}, take:5 }),
                keywordList.length > 0
                    ? prisma.trainingProgram.findMany({ where: buildSearch('name', 'description'), take: 3 })
                    : Promise.resolve([]),
                keywordList.length > 0
                    ? prisma.blogPost.findMany({ where: { ...buildSearch('title', 'content'), published: true }, take: 3 })
                    : Promise.resolve([]),
                keywordList.length > 0
                    ? prisma.news.findMany({ where: { ...buildSearch('title', 'content'), published: true }, take: 3 })
                    : Promise.resolve([]),
                prisma.product.findMany({
                    where: { featured: true, archivedAt:null },
                    take: 3,
                }),
                prisma.promotionalBanner.findMany({
                    where: { isActive: true },
                    orderBy: { priority: "desc" },
                    take: 2,
                }),
            ]);
        } catch (dbError) {
            console.warn("Could not fetch DB context for AI chat (DB may be unreachable), continuing with defaults:", dbError);
        }

        try {
            settings = await prisma.globalConfig.findMany({});
        } catch (error) {
            console.warn("Could not fetch site settings (using defaults):", error);
        }

        // Convert settings array to object for easier access
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        // Default values if settings are not present
        const companyInfo = {
            name: settingsMap.company_name || "Kosvana by Mush Agro Products",
            address: settingsMap.company_address || "Kosvana, Herbertpur, Dehradun, Uttarakhand, India",
            mapLink: settingsMap.google_maps_link || "https://www.google.com/maps/place/Kosvana+by+MushAgroProducts/data=!4m2!3m1!1s0x0:0xc1d016cb5b5c812a?sa=X&ved=1t:2428&ictx=111",
            email: settingsMap.contact_email || "concierge@kosvana.com",
            phone: settingsMap.contact_phone || "+91-7618362662",
            hours: settingsMap.business_hours || "Monday - Saturday: 9:00 AM - 6:00 PM\n  * Sunday: 9:00 AM - 3:00 PM",
        };

        const baseUrl = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || "https://www.mushmush.in";

        const context = `
Relevant Kosvana Products:
${products.map(p => `- ${p.title} (₹${p.price}): ${p.description.substring(0, 100)}...
  Link: ${baseUrl}/shop-details/${p.slug}
  Status: ${p.inStock ? '✅ Available' : '❌ Out of Stock'}`).join("\n")}

Featured/Trending Products:
${featured.map(p => `- ${p.title}: ${p.description.substring(0, 60)}...
  Link: ${baseUrl}/shop-details/${p.slug}
  Status: ${p.inStock ? '✅ Available' : '❌ Out of Stock'}`).join("\n")}

Active Promotions:
${banners.map(b => `- ${b.title}: ${b.discount || b.subtitle}`).join("\n")}

Relevant Training Programs:
${programs.map(p => `- ${p.name}: ${p.description.substring(0, 100)}...`).join("\n")}

Relevant Articles:
${blogs.map(b => `- ${b.title}: ${b.excerpt || b.content.substring(0, 100)}...`).join("\n")}

Relevant News:
${news.map(n => `- ${n.title}: ${n.excerpt || n.content.substring(0, 100)}...`).join("\n")}
`;

        const systemPrompt = `You are the official AI guide for Kosvana, a premium natural products brand by Mush Agro Products.
Your goal is to help users with questions about our products (mushrooms, dry fruits, seeds & spices), cultivation training, and wellness offerings.
Be warm, knowledgeable, and professional.

Use the following context from our database to provide accurate information if available:
${context}

COMPANY INFORMATION:
- Name: ${companyInfo.name}
- Location: ${companyInfo.address} (Map: ${companyInfo.mapLink})
- Training Center: Kosvana Training Center (located at the same address)
- Email: ${companyInfo.email}
- Phone: ${companyInfo.phone}
- Business Hours:
  * ${companyInfo.hours}

ABOUT KOSVANA:
- Founded by: Bhartendu, Pravesh & Vikrant (left conventional jobs to pursue mushroom cultivation full-time)
- The founders are still the growers and look after every stage of cultivation themselves.
- Fresh mushrooms go to kitchens in Dehradun. Dried mushrooms, spices, dry fruits and seeds ship across India.

DO NOT CLAIM: organic certification, "zero chemicals", any government or other certification, production volumes, awards, or health cures. We have not published these. If asked, say you don't have that information and offer the contact details.

MUSHROOMS: use the product data above and the searchProducts tool for what is on sale now (for example oyster, king oyster, shiitake, lion's mane, ganoderma and turkey tail, with powders and a tincture). Do not list varieties that are not in the product data.

TRAINING PROGRAMS:
- 5-day training programs in oyster and shiitake mushroom growing, taught by Pravesh Rawat and Vikrant Rai.
- For anyone who wants to grow mushrooms, from home growers to people who plan to start a farm.
- Use the training data above for batch dates, prices and seats. Do not invent dates or batch types.

OTHER PRODUCTS:
- Dry Fruits (almonds, cashews, walnuts, raisins, apricots)
- Seeds (chia, pumpkin, sunflower, sesame, mustard)
- Grow your own: mushroom spawn and grow bags are growing supplies, not food. They are sold in the separate "Grow your own" section on the home page (${baseUrl}/#grow), not with Seeds. Never suggest eating them.
- Spices (turmeric, black pepper, cumin, cloves, garlic, black garlic)

When users ask about our company, founders, story or training programs, use only the information above. If something is not stated here or in the data above, say you don't know and offer the contact details.

If the user asks for a product or its price, ALWAYS provide the direct link to the product page and mention stock availability.

To order products or get in touch, users can contact us via:
- WhatsApp: https://wa.me/917618362662
- Email: mailto:concierge@kosvana.com
- Phone: tel:+917618362662

Users can browse and buy products directly in this chat! They can tap the "Shop" tab or ask you about products.

IMPORTANT RULES FOR PRODUCT QUERIES:
- When a user asks about products, pricing, or wants to buy something, ALWAYS use the searchProducts tool first.
- After the tool returns product cards, keep your follow-up text VERY SHORT — just 1 sentence like "Here are our dry fruits! Tap Buy to purchase." or "Found X products for you."
- NEVER repeat product names, prices, or details that are already visible in the product cards.
- NEVER add contact info (WhatsApp/Email/Phone) to product responses — only add them when the user specifically asks for contact details or when ending the conversation.
- If fewer products show than expected, mention they can tap the "Shop" tab to browse the full catalog.

If you don't know the answer or the context doesn't provide it, answer based on your general mushroom knowledge but clarify that for Kosvana-specific details, the user should check the relevant pages or contact us.

Only include contact information when the user asks for it or when they need human assistance.

Answer concisely. No filler text. Keep responses under 2-3 sentences when product cards are shown.`;

        const result = streamText({
            model: google("gemini-2.5-flash"),
            system: systemPrompt,
            messages: convertToCoreMessages(messages),
            tools: {
                searchProducts: {
                    description: "Search and display product cards in the chat. Use this when the user asks about products, pricing, availability, or wants to buy something.",
                    inputSchema: z.object({
                        query: z.string().describe("Search keywords to find relevant products"),
                    }),
                    execute: async ({ query }: { query: string }) => {
                        try {
                            const keywords = query.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
                            const where: any = keywords.length > 0
                                ? {
                                    OR: keywords.flatMap((kw: string) => [
                                        { title: { contains: kw, mode: "insensitive" as const } },
                                        { description: { contains: kw, mode: "insensitive" as const } },
                                    ]),
                                }
                                : {};

                            let foundProducts = await prisma.product.findMany({
                                where:{...where, archivedAt:null},
                                include: {
                                    reviews: { select: { rating: true } },
                                    discounts: activeDiscountsInclude(),
                                },
                                take: 8,
                            });

                            // Fallback: if no keyword matches, show featured products
                            if (foundProducts.length === 0) {
                                foundProducts = await prisma.product.findMany({
                                    where: { featured: true, archivedAt:null },
                                    include: {
                                        reviews: { select: { rating: true } },
                                        discounts: activeDiscountsInclude(),
                                    },
                                    take: 8,
                                });
                            }

                            return foundProducts.map((p) => {
                                const avgRating = p.reviews.length > 0
                                    ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
                                    : 0;

                                // Same discount rule as /api/products and order pricing
                                const { discountedPrice, discountPercentage } = computeProductDiscount(p.price, p.discounts);

                                return {
                                    id: p.id,
                                    title: p.title,
                                    slug: p.slug,
                                    price: p.price,
                                    discountedPrice,
                                    discountPercentage: Math.round(discountPercentage),
                                    hasDiscount: discountedPrice !== null,
                                    inStock: p.inStock,
                                    imgs: p.imgs as any,
                                    averageRating: Math.round(avgRating * 10) / 10,
                                    reviewCount: p.reviews.length,
                                    measurementValue: p.measurementValue,
                                    measurementType: p.measurementType,
                                    stockQuantity: availablePacks(p.quantity, p.measurementValue, p.measurementType),
                                };
                            });
                        } catch (err) {
                            console.error("searchProducts tool error:", err);
                            return [];
                        }
                    },
                },
            },
            stopWhen: stepCountIs(3),
        });

        return result.toUIMessageStreamResponse();
    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return new Response("Failed to generate response", { status: 500 });
    }
}
