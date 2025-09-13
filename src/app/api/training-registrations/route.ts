import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/training-registrations - Create new training registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      trainingProgramId,
      participantName,
      participantEmail,
      participantPhone,
      participantAddress,
      preferredStartDate,
      specialRequirements,
      userId,
    } = body;

    // Validate required fields
    if (!trainingProgramId || !participantName || !participantEmail || !participantPhone || !participantAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get training program to calculate total amount
    const trainingProgram = await prisma.trainingProgram.findUnique({
      where: { id: trainingProgramId },
    });

    if (!trainingProgram || !trainingProgram.isActive) {
      return NextResponse.json(
        { error: "Training program not found or inactive" },
        { status: 404 }
      );
    }

    // Generate unique registration number
    const registrationNumber = `TR${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create registration
    const registration = await prisma.trainingRegistration.create({
      data: {
        registrationNumber,
        trainingProgramId,
        participantName,
        participantEmail,
        participantPhone,
        participantAddress,
        preferredStartDate: preferredStartDate ? new Date(preferredStartDate) : null,
        specialRequirements,
        totalAmount: trainingProgram.price,
        userId: userId || null,
      },
      include: {
        trainingProgram: true,
      },
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error("Error creating training registration:", error);
    return NextResponse.json(
      { error: "Failed to create registration" },
      { status: 500 }
    );
  }
}
