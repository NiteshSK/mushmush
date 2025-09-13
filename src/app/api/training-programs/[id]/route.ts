import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/training-programs/[id] - Get specific training program
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid training program ID" },
        { status: 400 }
      );
    }

    const trainingProgram = await prisma.trainingProgram.findUnique({
      where: {
        id: id,
        isActive: true,
      },
    });

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
