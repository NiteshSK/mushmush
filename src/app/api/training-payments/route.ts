import { WorkflowError, workflowFailure } from "@/lib/staff-workflow";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Registrations are created only by signed-in accounts (training-registrations
    // requires auth), so a payment can only come from the account that owns it.
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to submit your payment." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const registrationId = formData.get('registrationId') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const upiTransactionId = formData.get('upiTransactionId') as string;
    const amount = parseFloat(formData.get('amount') as string);

    if (!registrationId || !paymentMethod || !upiTransactionId || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Missing required payment information" },
        { status: 400 }
      );
    }

    // Validate UPI transaction ID format (same pattern the old verifier required)
    if (!/^[a-zA-Z0-9_-]{12,37}$/.test(upiTransactionId)) {
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

    // Answer 404 for someone else's registration so IDs cannot be probed.
    if (!registration || registration.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    if (registration.status !== 'PENDING') {
      return NextResponse.json(
        { error: "This registration is not awaiting payment." },
        { status: 409 }
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

    // Check for duplicate transaction ID (transactionId is unique across all payments)
    const duplicateTransaction = await prisma.upi_payments.findFirst({
      where: {
        transactionId: upiTransactionId
      }
    });

    if (duplicateTransaction) {
      return NextResponse.json(
        { error: "This transaction ID has already been used" },
        { status: 400 }
      );
    }

    // A transaction ID typed by the customer is NOT proof of payment.
    // Record it as PENDING; the registration stays PENDING until an admin
    // verifies the payment (/api/admin/payment-verification or
    // /api/quick-verify-payment) or a signed webhook confirms it.
    const payment = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM training_registrations WHERE id = ${registrationId} FOR UPDATE`;
      const current = await tx.trainingRegistration.findUnique({where:{id:registrationId},select:{status:true}});
      if (current?.status !== "PENDING" || await tx.upi_payments.findFirst({where:{trainingRegistrationId:registrationId,status:{in:["PENDING","VERIFIED"]}}}))
        throw new WorkflowError("This seat already has a payment or is no longer pending.");
    return tx.upi_payments.create({
      data: {
        id: `upi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: registration.totalAmount,
        status: 'PENDING',
        resourceType: 'training_registration',
        transactionId: upiTransactionId,
        trainingRegistrationId: registrationId,
        updatedAt: new Date()
      }
    });
    });

    return NextResponse.json({
      success: true,
      message: "Payment details submitted. We will confirm your registration after we verify the payment.",
      registration: {
        id: registration.id,
        registrationNumber: registration.registrationNumber,
        paymentStatus: payment.status,
        paymentDate: payment.createdAt,
        upiTransactionId: payment.transactionId,
        status: registration.status
      }
    });

  } catch (error) {
    return workflowFailure(error);
  }
}

// GET endpoint to check payment status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to see this registration." },
        { status: 401 }
      );
    }
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
        userId: true,
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

    // Only the account that owns the registration, or an admin, may see it.
    const { userId, ...publicRegistration } = registration;
    if (session.user.role !== 'ADMIN' && userId !== session.user.id) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(publicRegistration);

  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
