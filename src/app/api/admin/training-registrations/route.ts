import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/training-registrations - Get all training registrations (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
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

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching training registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch training registrations" },
      { status: 500 }
    );
  }
}
