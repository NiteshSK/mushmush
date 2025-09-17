import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/training-programs/[id] - Get specific training program
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const identifier = params.id;
    
    if (!identifier) {
      return NextResponse.json(
        { error: "Identifier is required" },
        { status: 400 }
      );
    }

    // Try to parse as number first, if fails treat as slug
    const numericId = parseInt(identifier);
    let trainingProgram;

    if (!isNaN(numericId)) {
      // Search by ID
      trainingProgram = await prisma.trainingProgram.findUnique({
        where: {
          id: numericId,
          isActive: true,
        },
      });
    } else {
      // Search by slug
      trainingProgram = await prisma.trainingProgram.findFirst({
        where: {
          slug: identifier,
          isActive: true,
        },
      });
    }

    if (!trainingProgram) {
      return NextResponse.json(
        { error: "Training program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(trainingProgram);
  } catch (error) {
    console.error("Error fetching training program:", error);
    return NextResponse.json(
      { error: "Failed to fetch training program" },
      { status: 500 }
    );
  }
}
