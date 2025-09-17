import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/admin";
import { sendRegistrationConfirmationEmail } from "@/lib/email";

// POST /api/training-registrations - Create new training registration
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await requireAuth();
    
    const body = await request.json();
    const {
      trainingProgramId,
      participantName,
      participantEmail,
      participantPhone,
      participantAddress,
      preferredStartDate,
      specialRequirements,
    } = body;

    // Validate required fields
    if (!trainingProgramId || !participantName || !participantEmail || !participantPhone || !participantAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for duplicate registration
    const existingRegistration = await prisma.trainingRegistration.findFirst({
      where: {
        userId: user.id,
        trainingProgramId: trainingProgramId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
        }
      }
    });

    if (existingRegistration) {
      return NextResponse.json(
        { 
          error: "You are already registered for this training program",
          existingRegistration: {
            registrationNumber: existingRegistration.registrationNumber,
            status: existingRegistration.status,
            programName: existingRegistration.trainingProgram?.name || 'Training Program'
          }
        },
        { status: 409 } // 409 Conflict
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

    // Create registration with authenticated user
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
        userId: user.id, // Always use authenticated user ID
      },
      include: {
        trainingProgram: true,
      },
    });

    // Send confirmation email with timetable information
    await sendRegistrationConfirmationEmail({
      registrationNumber: registration.registrationNumber,
      programName: registration.trainingProgram.name,
      participantName: registration.participantName,
      totalAmount: registration.totalAmount,
      status: registration.status,
      participantEmail: registration.participantEmail,
      programDuration: registration.trainingProgram.duration,
      programSchedule: registration.trainingProgram.schedule,
      programStartDate: registration.preferredStartDate 
        ? registration.preferredStartDate.toLocaleDateString() 
        : registration.trainingProgram.startDate 
          ? new Date(registration.trainingProgram.startDate).toLocaleDateString()
          : undefined,
      programLocation: registration.trainingProgram.location,
      programInstructor: registration.trainingProgram.instructor
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: "Authentication required. Please login to register for training." },
        { status: 401 }
      );
    }
    
    console.error("Error creating training registration:", error);
    return NextResponse.json(
      { error: "Failed to create registration" },
      { status: 500 }
    );
  }
}
