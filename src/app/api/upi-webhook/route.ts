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

    // Find pending registration by amount with pending payment
    const registration = await prisma.trainingRegistration.findFirst({
      where: {
        totalAmount: amount,
        status: 'PENDING',
        upi_payments: {
          some: {
            status: 'PENDING'
          }
        }
      },
      include: {
        trainingProgram: true,
        user: true,
        upi_payments: {
          where: {
            status: 'PENDING'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
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
      const pendingPayment = registration.upi_payments[0];
      
      // Update the UPI payment status
      await prisma.upi_payments.update({
        where: { id: pendingPayment.id },
        data: {
          status: 'VERIFIED',
          transactionId: transactionId,
          updatedAt: new Date(timestamp || Date.now())
        }
      });

      // Update registration status
      const updatedRegistration = await prisma.trainingRegistration.update({
        where: { id: registration.id },
        data: {
          status: 'CONFIRMED'
        },
        include: {
          trainingProgram: true,
          user: true,
          upi_payments: true
        }
      });

      // Send payment confirmation email
      try {
        const verifiedPayment = updatedRegistration.upi_payments.find(p => p.status === 'VERIFIED');
        await sendPaymentConfirmationEmail({
          registrationNumber: updatedRegistration.registrationNumber,
          programName: updatedRegistration.trainingProgram.name,
          participantName: updatedRegistration.user.name || 'Valued Customer',
          totalAmount: updatedRegistration.totalAmount,
          paymentStatus: 'VERIFIED',
          paymentMethod: 'UPI',
          upiTransactionId: transactionId,
          paymentDate: verifiedPayment?.createdAt || new Date(),
          participantEmail: updatedRegistration.user.email,
          programDuration: updatedRegistration.trainingProgram.duration.toString(),
          programSchedule: updatedRegistration.trainingProgram.dailyHours,
          programStartDate: new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          programLocation: 'MushMush Training Center',
          programInstructor: 'Expert Trainer'
        });
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
      const pendingPayment = registration.upi_payments[0];
      
      await prisma.upi_payments.update({
        where: { id: pendingPayment.id },
        data: {
          status: 'FAILED',
          transactionId: transactionId,
          updatedAt: new Date(timestamp || Date.now())
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
