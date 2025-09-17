import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate webhook payload
    const {
      transactionId,
      amount,
      upiId,
      status,
      timestamp,
      metadata
    } = body;

    if (!transactionId || !amount || !status) {
      return NextResponse.json(
        { error: "Missing required webhook data" },
        { status: 400 }
      );
    }

    // Verify webhook signature (in production, implement proper signature verification)
    const signature = request.headers.get('x-webhook-signature');
    if (!signature) {
      console.log('Webhook received without signature - proceeding in development mode');
    }

    // Find pending registration by amount and UPI ID
    const registration = await prisma.trainingRegistration.findFirst({
      where: {
        totalAmount: amount,
        paymentStatus: 'PENDING',
        // Additional matching criteria can be added here
      },
      include: {
        trainingProgram: true,
        user: true
      }
    });

    if (!registration) {
      console.log(`No pending registration found for amount: ${amount}`);
      return NextResponse.json(
        { error: "No matching registration found" },
        { status: 404 }
      );
    }

    // Update registration based on payment status
    if (status === 'SUCCESS' || status === 'COMPLETED') {
      const updatedRegistration = await prisma.trainingRegistration.update({
        where: { id: registration.id },
        data: {
          paymentStatus: 'COMPLETED',
          paymentMethod: 'UPI',
          upiTransactionId: transactionId,
          upiId: upiId,
          paymentDate: new Date(timestamp || Date.now()),
          status: 'CONFIRMED'
        },
        include: {
          trainingProgram: true,
          user: true
        }
      });

      // Send payment confirmation email
      try {
        await sendPaymentConfirmationEmail(
          updatedRegistration.user.email,
          updatedRegistration.user.name || 'Valued Customer',
          updatedRegistration.registrationNumber,
          updatedRegistration.trainingProgram.name,
          updatedRegistration.totalAmount,
          'UPI',
          transactionId,
          {
            programDuration: updatedRegistration.trainingProgram.duration,
            schedule: updatedRegistration.trainingProgram.dailyHours,
            startDate: new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            location: 'MushMush Training Center',
            instructor: 'Expert Trainer'
          }
        );
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError);
        // Don't fail the webhook if email fails
      }

      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully',
        registrationId: registration.id,
        registrationNumber: registration.registrationNumber
      });
    } else if (status === 'FAILED') {
      await prisma.trainingRegistration.update({
        where: { id: registration.id },
        data: {
          paymentStatus: 'FAILED',
          upiTransactionId: transactionId,
          paymentDate: new Date(timestamp || Date.now())
        }
      });

      return NextResponse.json({
        success: false,
        message: 'Payment failed',
        registrationId: registration.id
      });
    } else {
      // PENDING or other statuses
      return NextResponse.json({
        success: false,
        message: `Payment status: ${status}`,
        registrationId: registration.id
      });
    }

  } catch (error) {
    console.error('UPI webhook error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle webhook verification (GET request for webhook setup)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const challenge = searchParams.get('challenge');
  
  if (challenge) {
    // Return challenge for webhook verification
    return NextResponse.json({ challenge });
  }
  
  return NextResponse.json({ status: 'Webhook endpoint active' });
}
