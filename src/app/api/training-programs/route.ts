import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/training-programs - Get all active training programs
export async function GET() {
  try {
    const trainingPrograms = await prisma.trainingProgram.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        type: 'asc',
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
