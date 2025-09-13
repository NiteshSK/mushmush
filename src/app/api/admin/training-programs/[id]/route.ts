import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/training-programs/[id] - Get specific training program (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid training program ID" },
        { status: 400 }
      );
    }

    const trainingProgram = await prisma.trainingProgram.findUnique({
      where: { id },
      include: {
        registrations: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
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

// PUT /api/admin/training-programs/[id] - Update training program (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid training program ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, price, duration, dailyHours, type, isActive } = body;

    // Generate slug from name if name is updated
    let updateData: any = {};
    
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (dailyHours !== undefined) updateData.dailyHours = dailyHours;
    if (type !== undefined) updateData.type = type;
    if (isActive !== undefined) updateData.isActive = isActive;

    const trainingProgram = await prisma.trainingProgram.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(trainingProgram);
  } catch (error) {
    console.error("Error updating training program:", error);
    return NextResponse.json(
      { error: "Failed to update training program" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/training-programs/[id] - Delete training program (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid training program ID" },
        { status: 400 }
      );
    }

    // Check if there are any registrations
    const registrationCount = await prisma.trainingRegistration.count({
      where: { trainingProgramId: id },
    });

    if (registrationCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete training program with existing registrations. Deactivate it instead." },
        { status: 400 }
      );
    }

    await prisma.trainingProgram.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Training program deleted successfully" });
  } catch (error) {
    console.error("Error deleting training program:", error);
    return NextResponse.json(
      { error: "Failed to delete training program" },
      { status: 500 }
    );
  }
}
