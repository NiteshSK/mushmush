import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    const schedules = await prisma.trainingSchedule.findMany({
      where: { 
        trainingProgramId: parseInt(id),
        isActive: true 
      },
      orderBy: { dayNumber: 'asc' }
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching training schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch training schedules" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const {
      dayNumber,
      date,
      title,
      description,
      topics,
      practicalSessions,
      theoreticalSessions,
      learningObjectives,
      materials,
      instructor,
      startTime,
      endTime
    } = body;

    // Validate required fields
    if (!dayNumber || !date || !title || !description || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if training program exists
    const trainingProgram = await prisma.trainingProgram.findUnique({
      where: { id: parseInt(id) }
    });

    if (!trainingProgram) {
      return NextResponse.json(
        { error: "Training program not found" },
        { status: 404 }
      );
    }

    // Check if schedule for this day already exists
    const existingSchedule = await prisma.trainingSchedule.findFirst({
      where: {
        trainingProgramId: parseInt(id),
        dayNumber,
        isActive: true
      }
    });

    if (existingSchedule) {
      return NextResponse.json(
        { error: "Schedule for this day already exists" },
        { status: 400 }
      );
    }

    const schedule = await prisma.trainingSchedule.create({
      data: {
        trainingProgramId: parseInt(id),
        dayNumber,
        date: new Date(date),
        title,
        description,
        topics: topics || [],
        practicalSessions: practicalSessions || [],
        theoreticalSessions: theoreticalSessions || [],
        learningObjectives: learningObjectives || [],
        materials: materials || [],
        instructor,
        startTime,
        endTime
      }
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Error creating training schedule:", error);
    return NextResponse.json(
      { error: "Failed to create training schedule" },
      { status: 500 }
    );
  }
}
