import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET /api/training-registrations/check?programId=X
// Check if the authenticated user is already registered for a specific training program
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');

    if (!programId) {
      return NextResponse.json(
        { error: "Program ID is required" },
        { status: 400 }
      );
    }

    // Check if user has any existing registration for this program
    const existingRegistration = await prisma.trainingRegistration.findFirst({
      where: {
        userId: session.user.id,
        trainingProgramId: parseInt(programId),
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
        }
      },
      include: {
        trainingProgram: true,
        upi_payments: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (existingRegistration) {
      const latestPayment = existingRegistration.upi_payments[0];
      return NextResponse.json({
        isRegistered: true,
        registration: {
          id: existingRegistration.id,
          registrationNumber: existingRegistration.registrationNumber,
          status: existingRegistration.status,
          paymentStatus: latestPayment?.status || 'PENDING',
          programName: existingRegistration.trainingProgram.name,
          createdAt: existingRegistration.createdAt
        }
      });
    }

    return NextResponse.json({
      isRegistered: false
    });

  } catch (error) {
    console.error('Error checking registration status:', error);
    return NextResponse.json(
      { error: "Failed to check registration status" },
      { status: 500 }
    );
  }
}
