// Simple Payment Verification Tool
// This provides immediate verification for UPI transactions

import { prisma } from './prisma';
import { sendPaymentConfirmationEmail } from './email';

export interface PaymentVerificationRequest {
  registrationId: string;
  transactionId: string;
  amount: number;
}

export interface PaymentVerificationResult {
  success: boolean;
  message: string;
  registration?: any;
  error?: string;
}

export async function verifyAndProcessPayment(
  request: PaymentVerificationRequest
): Promise<PaymentVerificationResult> {
  try {
    const { registrationId, transactionId, amount } = request;

    // Validate required fields
    if (!registrationId || !transactionId || !amount) {
      return {
        success: false,
        message: 'Missing required fields',
        error: 'REGISTRATION_ID, TRANSACTION_ID, and AMOUNT are required'
      };
    }

    // Check if registration exists and is pending
    const registration = await prisma.trainingRegistration.findUnique({
      where: { id: registrationId },
      include: {
        trainingProgram: true,
        user: true
      }
    });

    if (!registration) {
      return {
        success: false,
        message: 'Registration not found',
        error: 'Invalid registration ID'
      };
    }

    if (registration.paymentStatus === 'COMPLETED') {
      return {
        success: false,
        message: 'Payment already completed',
        error: 'This registration has already been paid for'
      };
    }

    // Verify amount matches
    if (Math.abs(registration.totalAmount - amount) > 0.01) {
      return {
        success: false,
        message: 'Amount mismatch',
        error: `Expected ₹${registration.totalAmount}, but got ₹${amount}`
      };
    }

    // Check for duplicate transaction ID
    const existingPayment = await prisma.trainingRegistration.findFirst({
      where: {
        upiTransactionId: transactionId,
        paymentStatus: { in: ['PROCESSING', 'COMPLETED'] }
      }
    });

    if (existingPayment) {
      return {
        success: false,
        message: 'Transaction ID already used',
        error: 'This transaction ID has already been used for another payment'
      };
    }

    // Basic transaction ID format validation
    if (transactionId.length < 10 || transactionId.length > 37) {
      return {
        success: false,
        message: 'Invalid transaction ID format',
        error: 'Transaction ID must be between 10-37 characters'
      };
    }

    // Update registration with payment details
    const updatedRegistration = await prisma.trainingRegistration.update({
      where: { id: registrationId },
      data: {
        paymentStatus: 'COMPLETED',
        paymentMethod: 'UPI',
        upiTransactionId: transactionId,
        paymentDate: new Date(),
        status: 'CONFIRMED'
      },
      include: {
        trainingProgram: true,
        user: true
      }
    });

    // Send payment confirmation email
    try {
      await sendPaymentConfirmationEmail({
        registrationNumber: updatedRegistration.registrationNumber,
        programName: updatedRegistration.trainingProgram.name,
        participantName: updatedRegistration.user.name || 'Valued Customer',
        totalAmount: updatedRegistration.totalAmount,
        paymentStatus: 'COMPLETED',
        paymentMethod: 'UPI',
        upiTransactionId: transactionId,
        paymentDate: updatedRegistration.paymentDate,
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
      // Don't fail the payment process if email fails
    }

    return {
      success: true,
      message: 'Payment verified and processed successfully',
      registration: updatedRegistration
    };

  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      success: false,
      message: 'Payment verification failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Helper function to get pending registrations for verification
export async function getPendingRegistrations() {
  try {
    const pendingRegistrations = await prisma.trainingRegistration.findMany({
      where: {
        paymentStatus: 'PENDING'
      },
      include: {
        trainingProgram: true,
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return pendingRegistrations;
  } catch (error) {
    console.error('Error fetching pending registrations:', error);
    return [];
  }
}

// Quick verification function for admin use
export async function quickVerifyPayment(
  transactionId: string,
  amount: number
): Promise<PaymentVerificationResult> {
  try {
    // Find pending registration by amount
    const registration = await prisma.trainingRegistration.findFirst({
      where: {
        totalAmount: amount,
        paymentStatus: 'PENDING'
      },
      include: {
        trainingProgram: true,
        user: true
      }
    });

    if (!registration) {
      return {
        success: false,
        message: 'No pending registration found for this amount',
        error: `No pending registration with amount ₹${amount}`
      };
    }

    return await verifyAndProcessPayment({
      registrationId: registration.id,
      transactionId,
      amount
    });

  } catch (error) {
    console.error('Quick verification error:', error);
    return {
      success: false,
      message: 'Quick verification failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
