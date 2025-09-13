import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET - Fetch all pending payments for admin verification
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PROCESSING';

    const registrations = await prisma.trainingRegistration.findMany({
      where: {
        paymentStatus: status as any
      },
      include: {
        trainingProgram: {
          select: {
            name: true,
            price: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });

    return NextResponse.json(registrations);

  } catch (error) {
    console.error("Payment verification fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Verify or reject payment
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { registrationId, action, adminNotes } = await request.json();

    if (!registrationId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    const registration = await prisma.trainingRegistration.findUnique({
      where: { id: registrationId },
      include: { trainingProgram: true, user: true }
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    let updateData: any = {
      updatedAt: new Date()
    };

    if (action === 'approve') {
      updateData.paymentStatus = 'COMPLETED';
      updateData.status = 'CONFIRMED';
    } else {
      updateData.paymentStatus = 'FAILED';
      updateData.status = 'CANCELLED';
    }

    const updatedRegistration = await prisma.trainingRegistration.update({
      where: { id: registrationId },
      data: updateData,
      include: {
        trainingProgram: true,
        user: true
      }
    });

    // TODO: Send confirmation/rejection email to user
    // await sendPaymentStatusEmail(updatedRegistration, action, adminNotes);

    return NextResponse.json({
      success: true,
      message: `Payment ${action}d successfully`,
      registration: updatedRegistration
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
