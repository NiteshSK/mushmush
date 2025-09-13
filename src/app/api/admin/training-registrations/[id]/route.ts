import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/training-registrations/[id] - Get specific training registration (admin only)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const registration = await prisma.trainingRegistration.findUnique({
      where: { id: params.id },
      include: {
        trainingProgram: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Training registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(registration);
  } catch (error) {
    console.error("Error fetching training registration:", error);
    return NextResponse.json(
      { error: "Failed to fetch training registration" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/training-registrations/[id] - Update training registration status (admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const registration = await prisma.trainingRegistration.update({
      where: { id: params.id },
      data: { status },
      include: {
        trainingProgram: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(registration);
  } catch (error) {
    console.error("Error updating training registration:", error);
    return NextResponse.json(
      { error: "Failed to update training registration" },
      { status: 500 }
    );
  }
}
