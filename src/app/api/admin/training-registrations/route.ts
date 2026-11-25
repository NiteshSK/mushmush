import { NextRequest, NextResponse } from "next/server";
import { staffSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// GET /api/admin/training-registrations - Get all training registrations (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await staffSession("trainer");
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const trainingProgramId = searchParams.get('trainingProgramId');
    const status = searchParams.get('status');

    let whereClause: any = {};
    
    if (trainingProgramId) {
      whereClause.trainingProgramId = parseInt(trainingProgramId);
    }
    
    if (status) {
      const validStatuses = ['PENDING', 'PAYMENT_RECEIVED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      if (validStatuses.includes(status)) {
        whereClause.status = status;
      }
    }

    const registrations = await prisma.trainingRegistration.findMany({
      where: whereClause,
      skip: (Math.max(1, Number(searchParams.get("page")) || 1) - 1) * 25,
      take: 26,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({rows:registrations.slice(0,25),more:registrations.length>25});
  } catch (error) {
    console.error("Error fetching training registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch training registrations" },
      { status: 500 }
    );
  }
}
