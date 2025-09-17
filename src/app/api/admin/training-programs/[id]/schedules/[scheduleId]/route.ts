import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, scheduleId } = await params;
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
      endTime,
      isActive
    } = body;

    // Check if schedule exists
    const existingSchedule = await prisma.trainingSchedule.findFirst({
      where: {
        id: parseInt(scheduleId),
        trainingProgramId: parseInt(id)
      }
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    // Check if another schedule for this day already exists (excluding current one)
    if (dayNumber && dayNumber !== existingSchedule.dayNumber) {
      const conflictingSchedule = await prisma.trainingSchedule.findFirst({
        where: {
          trainingProgramId: parseInt(id),
          dayNumber,
          isActive: true,
          id: { not: parseInt(scheduleId) }
        }
      });

      if (conflictingSchedule) {
        return NextResponse.json(
          { error: "Schedule for this day already exists" },
          { status: 400 }
        );
      }
    }

    const schedule = await prisma.trainingSchedule.update({
      where: { id: parseInt(scheduleId) },
      data: {
        ...(dayNumber && { dayNumber }),
        ...(date && { date: new Date(date) }),
        ...(title && { title }),
        ...(description && { description }),
        ...(topics && { topics }),
        ...(practicalSessions && { practicalSessions }),
        ...(theoreticalSessions && { theoreticalSessions }),
        ...(learningObjectives && { learningObjectives }),
        ...(materials && { materials }),
        ...(instructor !== undefined && { instructor }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error updating training schedule:", error);
    return NextResponse.json(
      { error: "Failed to update training schedule" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, scheduleId } = await params;

    // Check if schedule exists
    const existingSchedule = await prisma.trainingSchedule.findFirst({
      where: {
        id: parseInt(scheduleId),
        trainingProgramId: parseInt(id)
      }
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.trainingSchedule.update({
      where: { id: parseInt(scheduleId) },
      data: { isActive: false }
    });

    return NextResponse.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting training schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete training schedule" },
      { status: 500 }
    );
  }
}
