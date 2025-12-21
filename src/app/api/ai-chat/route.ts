import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("DEBUG: GEMINI_API_KEY is missing from environment variables");
            return NextResponse.json(
                { error: "AI key not configured. Please add GEMINI_API_KEY to your .env file." },
                { status: 500 }
            );
        }

        const lastMessage = messages[messages.length - 1].content;

        // Search for relevant context in the DB
        const [products, programs, blogs, featured, banners] = await Promise.all([
            prisma.product.findMany({
                where: {
                    OR: [
                        { title: { contains: lastMessage, mode: "insensitive" } },
                        { description: { contains: lastMessage, mode: "insensitive" } },
                    ],
                },
                take: 3,
            }),
            prisma.trainingProgram.findMany({
                where: {
                    OR: [
                        { name: { contains: lastMessage, mode: "insensitive" } },
                        { description: { contains: lastMessage, mode: "insensitive" } },
                    ],
                },
                take: 2,
            }),
            prisma.blogPost.findMany({
                where: {
                    OR: [
                        { title: { contains: lastMessage, mode: "insensitive" } },
                        { content: { contains: lastMessage, mode: "insensitive" } },
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

        let result;
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            result = await model.generateContent([
                systemPrompt,
                ...messages.map((m: any) => `${m.role === "user" ? "User" : "Mushy"}: ${m.content}`),
            ]);
        } catch (modelError: any) {
            console.error("DEBUG: Primary model (gemini-1.5-flash) failed. Checking available models...");

            // diagnostic: list models to see what is available
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
                const data = await response.json();
                console.log("DEBUG: Available Models for this API Key:", JSON.stringify(data, null, 2));

                // Try fallback to gemini-pro if available
                console.log("DEBUG: Attempting fallback to gemini-pro...");
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
                result = await fallbackModel.generateContent([
                    systemPrompt,
                    ...messages.map((m: any) => `${m.role === "user" ? "User" : "Mushy"}: ${m.content}`),
                ]);
            } catch (innerError: any) {
                throw new Error(`Both primary and fallback models failed. ${modelError.message}`);
            }
        }

        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ content: text });
    } catch (error: any) {
        console.error("AI Chat Error - Full Details:", {
            message: error.message,
            stack: error.stack,
            cause: error.cause
        });
        return NextResponse.json(
            { error: `Gemini Error: ${error.message}. Check server logs for available models.` },
            { status: 500 }
        );
    }
}
