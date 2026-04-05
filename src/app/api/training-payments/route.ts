import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendPaymentConfirmationEmail } from "@/lib/email";
import { upiVerifier, generateTransactionNote } from "@/lib/upi-verification";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const formData = await request.formData();
    const registrationId = formData.get('registrationId') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const upiTransactionId = formData.get('upiTransactionId') as string;
    const upiId = formData.get('upiId') as string;
    const amount = parseFloat(formData.get('amount') as string);

    if (!registrationId || !paymentMethod || !upiTransactionId || !amount) {
      return NextResponse.json(
        { error: "Missing required payment information" },
        { status: 400 }
      );
    }

    // Validate UPI transaction ID format (basic validation)
    if (upiTransactionId.length < 10) {
      return NextResponse.json(
        { error: "Invalid UPI transaction ID format" },
        { status: 400 }
      );
    }

    // Check if registration exists
    const registration = await prisma.trainingRegistration.findUnique({
      where: { id: registrationId },
      include: { trainingProgram: true }
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Verify amount matches registration
    if (Math.abs(registration.totalAmount - amount) > 0.01) {
      return NextResponse.json(
        { error: "Payment amount does not match registration amount" },
        { status: 400 }
      );
    }

    // Check if payment already exists for this registration
    const existingPayment = await prisma.upi_payments.findFirst({
      where: {
        trainingRegistrationId: registrationId,
        status: { in: ['PENDING', 'VERIFIED'] }
      }
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: "Payment already submitted for this registration" },
        { status: 400 }
      );
    }

    // Check for duplicate transaction ID
    const duplicateTransaction = await prisma.upi_payments.findFirst({
      where: {
        transactionId: upiTransactionId,
        status: { in: ['PENDING', 'VERIFIED'] }
      }
    });

    if (duplicateTransaction) {
      return NextResponse.json(
        { error: "This transaction ID has already been used" },
        { status: 400 }
      );
    }

    // Verify UPI transaction using automated verification system
    const verificationResult = await upiVerifier.verifyTransaction(upiTransactionId, amount, upiId);
    if (!verificationResult.isValid) {
      return NextResponse.json(
        { error: verificationResult.message || "UPI transaction verification failed" },
        { status: 400 }
      );
    }

    // Create UPI payment record
    const payment = await prisma.upi_payments.create({
      data: {
        id: `upi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: amount,
        status: 'VERIFIED', // Automatically verify since we did verification
        resourceType: 'training_registration',
        transactionId: upiTransactionId,
        trainingRegistrationId: registrationId,
        updatedAt: new Date()
      }
    });

    // Update registration status to payment received (awaiting admin verification)
    const updatedRegistration = await prisma.trainingRegistration.update({
      where: { id: registrationId },
      data: {
        status: 'PAYMENT_RECEIVED'
      },
      include: {
        trainingProgram: true,
        user: true,
        upi_payments: true
      }
    });

    // Send payment confirmation email with timetable information
    await sendPaymentConfirmationEmail({
      registrationNumber: updatedRegistration.registrationNumber,
      programName: updatedRegistration.trainingProgram.name,
      participantName: updatedRegistration.participantName,
      totalAmount: updatedRegistration.totalAmount,
      paymentStatus: payment.status,
      paymentMethod: paymentMethod,
      upiTransactionId: payment.transactionId,
      paymentDate: payment.createdAt,
      participantEmail: updatedRegistration.participantEmail,
      programDuration: updatedRegistration.trainingProgram.duration.toString(),
      programSchedule: updatedRegistration.trainingProgram.dailyHours,
      programStartDate: updatedRegistration.preferredStartDate 
        ? updatedRegistration.preferredStartDate.toLocaleDateString() 
        : new Date().toLocaleDateString(),
      programLocation: 'MushMush Training Center',
      programInstructor: 'MushMush Expert Team',
    });

    return NextResponse.json({
      success: true,
      message: "Payment confirmed successfully! Your registration has been confirmed.",
      registration: {
        id: updatedRegistration.id,
        registrationNumber: updatedRegistration.registrationNumber,
        paymentStatus: payment.status,
        paymentDate: payment.createdAt,
        upiTransactionId: payment.transactionId,
        status: updatedRegistration.status
      }
    });

  } catch (error) {
    console.error("Payment processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check payment status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('registrationId');

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required" },
        { status: 400 }
      );
    }

    const registration = await prisma.trainingRegistration.findUnique({
      where: { id: registrationId },
      select: {
        id: true,
        registrationNumber: true,
        status: true,
        totalAmount: true,
        trainingProgram: {
          select: {
            name: true,
            price: true
          }
        },
        upi_payments: {
          select: {
            status: true,
            transactionId: true,
            createdAt: true,
            amount: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Only allow user to see their own registration or admin to see all
    if (session?.user?.role !== 'ADMIN' && registration.id !== session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(registration);

  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
