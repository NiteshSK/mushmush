import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Find the training program by id
    const trainingProgram = await prisma.trainingProgram.findUnique({
      where: { id: parseInt(id) },
      include: {
        schedules: {
          where: { isActive: true },
          orderBy: { dayNumber: 'asc' },
          include: {
            instructor: true
          }
        }
      }
    });

    if (!trainingProgram) {
      return NextResponse.json(
        { error: "Training program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(trainingProgram.schedules);
  } catch (error) {
    console.error("Error fetching training schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch training schedule" },
      { status: 500 }
    );
  }
}
