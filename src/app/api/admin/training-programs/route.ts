import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/training-programs - Get all training programs (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const trainingPrograms = await prisma.trainingProgram.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    return NextResponse.json(trainingPrograms);
  } catch (error) {
    console.error("Error fetching training programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch training programs" },
      { status: 500 }
    );
  }
}

// POST /api/admin/training-programs - Create new training program (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, price, duration, dailyHours, type, hasEarlyBirdOffer, earlyBirdPrice, originalPrice, earlyBirdEndDate } = body;

    // Validate required fields
    if (!name || !description || !price || !duration || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate Early Bird pricing if enabled
    if (hasEarlyBirdOffer) {
      if (!earlyBirdPrice || !originalPrice) {
        return NextResponse.json(
          { error: "Early Bird price and original price are required when Early Bird offer is enabled" },
          { status: 400 }
        );
      }
      if (parseFloat(earlyBirdPrice) >= parseFloat(originalPrice)) {
        return NextResponse.json(
          { error: "Early Bird price must be less than original price" },
          { status: 400 }
        );
      }
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const trainingProgram = await prisma.trainingProgram.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        dailyHours: dailyHours || "5-6 hours",
        type,
        hasEarlyBirdOffer: hasEarlyBirdOffer || false,
        earlyBirdPrice: hasEarlyBirdOffer ? parseFloat(earlyBirdPrice) : null,
        originalPrice: hasEarlyBirdOffer ? parseFloat(originalPrice) : null,
        earlyBirdEndDate: hasEarlyBirdOffer && earlyBirdEndDate ? new Date(earlyBirdEndDate) : null,
      },
    });

    return NextResponse.json(trainingProgram, { status: 201 });
  } catch (error) {
    console.error("Error creating training program:", error);
    return NextResponse.json(
      { error: "Failed to create training program" },
      { status: 500 }
    );
  }
}
