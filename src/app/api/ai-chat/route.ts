import { streamText, convertToCoreMessages } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { prisma } from "@/lib/prisma";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Initialize Google AI with support for both naming conventions
const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response("Invalid messages", { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            console.error("DEBUG: AI API key is missing from environment variables");
            return new Response("AI key not configured", { status: 500 });
        }

        console.log("DEBUG: AI Key Source:", process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "GOOGLE_GENERATIVE_AI_API_KEY" : "GEMINI_API_KEY");

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

        // Search for relevant context in the DB
        const [products, programs, blogs, featured, banners] = await Promise.all([
            prisma.product.findMany({
                where: {
                    OR: [
                        { title: { contains: lastUserMessage, mode: "insensitive" } },
                        { description: { contains: lastUserMessage, mode: "insensitive" } },
                    ],
                },
                take: 3,
            }),
            prisma.trainingProgram.findMany({
                where: {
                    OR: [
                        { name: { contains: lastUserMessage, mode: "insensitive" } },
                        { description: { contains: lastUserMessage, mode: "insensitive" } },
                    ],
                },
                take: 2,
            }),
            prisma.blogPost.findMany({
                where: {
                    OR: [
                        { title: { contains: lastUserMessage, mode: "insensitive" } },
                        { content: { contains: lastUserMessage, mode: "insensitive" } },
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

        const context = `
Relevant Mushmush Products:
${products.map(p => `- ${p.title} (₹${p.price}): ${p.description.substring(0, 100)}...`).join("\n")}

Featured/Trending Products:
${featured.map(p => `- ${p.title}: ${p.description.substring(0, 60)}...`).join("\n")}

Active Promotions:
${banners.map(b => `- ${b.title}: ${b.discount || b.subtitle}`).join("\n")}

Relevant Training Programs:
${programs.map(p => `- ${p.name}: ${p.description.substring(0, 100)}...`).join("\n")}

Relevant Articles:
${blogs.map(b => `- ${b.title}: ${b.excerpt || b.content.substring(0, 100)}...`).join("\n")}
`;

        const systemPrompt = `You are "Mushy", the official AI guide for Mushmush, a premier mushroom cultivation and wellness company.
Your goal is to help users with their questions about mushrooms, cultivation training, and our health products.
Be friendly, professional, and slightly enthusiastic about mushrooms!

Use the following context from our database to provide accurate information if available:
${context}

If you don't know the answer or the context doesn't provide it, answer based on your general mushroom knowledge but clarify that for Mushmush-specific details (like exact training dates or shipping), the user should check the relevant pages or contact us.

Our main offerings:
1. Training Programs: We offer cultivation training for Oyster, Button, Shiitake, and Ganoderma mushrooms.
2. Wellness Products: We sell extract powders and dried mushrooms.
3. Expertise: We are pioneers in mushroom farming.

Answer concisely and helpfully.`;

        const result = streamText({
            model: google("gemini-2.0-flash"),
            system: systemPrompt,
            messages: convertToCoreMessages(messages),
        });

        return result.toUIMessageStreamResponse();
    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return new Response("Failed to generate response", { status: 500 });
    }
}
