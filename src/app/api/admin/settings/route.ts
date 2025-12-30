import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper to check admin access
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session?.user?.role !== "ADMIN") {
        return false;
    }
    return true;
}

export async function GET() {
    try {
        const isAdmin = await checkAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const settings = await prisma.globalConfig.findMany({
            orderBy: { key: "asc" },
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const isAdmin = await checkAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { settings } = body; // Expecting array of { key, value, label?, type?, group? }

        if (!Array.isArray(settings)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        const results = [];

        for (const setting of settings) {
            const { key, value, label, type, group } = setting;

            const updated = await prisma.globalConfig.upsert({
                where: { key },
                update: { value, label, type, group },
                create: { key, value, label, type, group },
            });
            results.push(updated);
        }

        return NextResponse.json({ success: true, count: results.length });
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
