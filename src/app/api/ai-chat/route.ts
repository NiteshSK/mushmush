import { streamText, convertToCoreMessages, createGateway } from "ai";
import { prisma } from "@/lib/prisma";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Initialize Vercel AI Gateway
const gateway = createGateway({
    apiKey: process.env.AI_GATEWAY_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response("Invalid messages", { status: 400 });
        }

        if (!process.env.AI_GATEWAY_API_KEY) {
            console.error("DEBUG: AI_GATEWAY_API_KEY is missing from environment variables");
            return new Response("AI Gateway not configured", { status: 500 });
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

        // Extract meaningful keywords from the query
        // Remove common words and punctuation to improve search accuracy
        const stopWords = ['what', 'is', 'the', 'a', 'an', 'of', 'for', 'in', 'on', 'at', 'to', 'price', '?', '!', '.'];
        const keywords = lastUserMessage
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word))
            .join(' ');

        // Use both the full message and extracted keywords for better matching
        const searchTerms = keywords || lastUserMessage;

        // Search for relevant context in the DB
        const [products, programs, blogs, news, featured, banners] = await Promise.all([
            prisma.product.findMany({
                where: {
                    OR: [
                        { title: { contains: searchTerms, mode: "insensitive" } },
                        { description: { contains: searchTerms, mode: "insensitive" } },
                    ],
                },
                take: 3,
            }),
            prisma.trainingProgram.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerms, mode: "insensitive" } },
                        { description: { contains: searchTerms, mode: "insensitive" } },
                    ],
                },
                take: 2,
            }),
            prisma.blogPost.findMany({
                where: {
                    OR: [
                        { title: { contains: searchTerms, mode: "insensitive" } },
                        { content: { contains: searchTerms, mode: "insensitive" } },
                    ],
                    published: true,
                },
                take: 2,
            }),
            prisma.news.findMany({
                where: {
                    OR: [
                        { title: { contains: searchTerms, mode: "insensitive" } },
                        { content: { contains: searchTerms, mode: "insensitive" } },
                    ],
                    published: true,
                },
                take: 2,
            }),
            prisma.product.findMany({
                where: { featured: true },
                take: 3,
            }),
            prisma.promotionalBanner.findMany({
                where: { isActive: true },
                orderBy: { priority: "desc" },
                take: 2,
            }),
        ]);

        // Fetch settings separately to handle potential DB schema mismatches (e.g. pending migrations)
        let settings: any[] = [];
        try {
            settings = await prisma.globalConfig.findMany({});
        } catch (error) {
            console.warn("Could not fetch site settings (using defaults):", error);
            // Fallback to empty array, defaults will be used below
        }

        // Convert settings array to object for easier access
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        // Default values if settings are not present
        const companyInfo = {
            name: settingsMap.company_name || "MushMush by Mush Agro Products",
            address: settingsMap.company_address || "Mush Agro Products, Herbetpur, Dehradun, Uttarakhand, India",
            mapLink: settingsMap.google_maps_link || "https://www.google.com/maps/search/Mush+Agro+Products+Herbertpur",
            email: settingsMap.contact_email || "mushagroprod@gmail.com",
            phone: settingsMap.contact_phone || "+91-7618362662",
            hours: settingsMap.business_hours || "Monday - Saturday: 9:00 AM - 6:00 PM\n  * Sunday: 9:00 AM - 3:00 PM",
        };

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.mushmush.in";

        const context = `
Relevant Mushmush Products:
${products.map(p => `- ${p.title} (₹${p.price}): ${p.description.substring(0, 100)}...
  Link: ${baseUrl}/shop-details/${p.slug}
  Status: ${p.inStock ? 'Available' : 'Out of Stock'}`).join("\n")}

Featured/Trending Products:
${featured.map(p => `- ${p.title}: ${p.description.substring(0, 60)}...
  Link: ${baseUrl}/shop-details/${p.slug}
  Status: ${p.inStock ? 'Available' : 'Out of Stock'}`).join("\n")}

Active Promotions:
${banners.map(b => `- ${b.title}: ${b.discount || b.subtitle}`).join("\n")}

Relevant Training Programs:
${programs.map(p => `- ${p.name}: ${p.description.substring(0, 100)}...`).join("\n")}

Relevant Articles:
${blogs.map(b => `- ${b.title}: ${b.excerpt || b.content.substring(0, 100)}...`).join("\n")}

Relevant News:
${news.map(n => `- ${n.title}: ${n.excerpt || n.content.substring(0, 100)}...`).join("\n")}
`;

        const systemPrompt = `You are "Mushy", the official AI guide for Mushmush, a premier mushroom cultivation and wellness company.
Your goal is to help users with their questions about mushrooms, cultivation training, and our health products.
Be friendly, professional, and slightly enthusiastic about mushrooms!

Use the following context from our database to provide accurate information if available:
${context}

COMPANY INFORMATION:
- Name: ${companyInfo.name}
- Location: ${companyInfo.address} (Map: ${companyInfo.mapLink})
- Training Center: MushMush Training Center (located at the same address)
- Email: ${companyInfo.email}
- Phone: ${companyInfo.phone}
- Business Hours:
  * ${companyInfo.hours}

ABOUT MUSHMUSH:
- Founded by: Bhartendu, Pravesh & Vikrant (left conventional jobs to pursue mushroom cultivation full-time)
- Philosophy: "Cultivating Purity, From Our Farm to Your Fork" - Zero chemicals, 100% organic cultivation
- Certification: Certified by Department of Mushroom, Uttarakhand, Dehradun
- Production Capacity:
  * 25+ kg daily fresh mushroom production
  * 5+ premium mushroom varieties
  * 2+ kg daily spawn distribution

MUSHROOM VARIETIES WE GROW:
- Oyster Mushrooms (fresh, dried)
- Shiitake
- Ganoderma (Reishi) - medicinal mushroom extract powders
- Button Mushrooms
- King Oyster

TRAINING PROGRAMS:
- Comprehensive training for aspiring entrepreneurs and hobbyists
- Covers basic to advanced cultivation techniques
- Weekend batches available
- Hands-on experience with expert guidance
- Training programs for: Oyster, Button, Shiitake, and Ganoderma mushrooms

FUTURE PRODUCTS (Coming Soon):
- Mushroom Pickles
- Mushroom Cookies
- Health Tinctures
- Dry Mushroom Powders

When users ask about our company, founders, story, certifications, production capacity, or training programs, use the above information to provide detailed and accurate responses.

If the user asks for a product or its price, ALWAYS provide the direct link to the product page and mention its availability status (Available or Out of Stock).

To order products, instruct the user to contact us via WhatsApp at https://wa.me/917618362662 with their information.

If you don't know the answer or the context doesn't provide it, answer based on your general mushroom knowledge but clarify that for Mushmush-specific details (like exact training dates or shipping), the user should check the relevant pages or contact us.

Answer concisely and helpfully.`;

        const result = streamText({
            model: gateway("google/gemini-2.0-flash"),
            system: systemPrompt,
            messages: convertToCoreMessages(messages),
        });

        return result.toUIMessageStreamResponse();
    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return new Response("Failed to generate response", { status: 500 });
    }
}
