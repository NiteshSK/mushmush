import { decideTraining, WorkflowError } from "./staff-workflow";
// Admin payment verification for training registrations.
// These functions confirm a registration. Call them only after the caller is
// authenticated as an ADMIN (see /api/quick-verify-payment).

import { prisma } from './prisma';


/**
 * Admin-recorded payment for ONE specific training registration.
 * The registration is always identified by its ID; the amount is never used
 * to find a registration (two customers can pay the same fee).
 */
export interface PaymentVerificationRequest {
  registrationId: string;
  transactionId: string;
  /** ID of the ADMIN user who checked the payment. Required. */
  verifiedByUserId: string;
  /** Optional cross-check. If given, it must equal the registration total. */
  amount?: number;
}

export interface PaymentVerificationResult {
  success: boolean;
  message: string;
  /** Suggested HTTP status for a failure (400, 404, 409 or 500). */
  status?: number;
  registration?: any;
  error?: string;
}



function failure(status: number, message: string, error: string): PaymentVerificationResult {
  return { success: false, status, message, error };
}

/**
 * Record a verified UPI payment for a registration and confirm it.
 * Callers MUST have authenticated the user as an ADMIN.
 */
export async function verifyAndProcessPayment(
  request: PaymentVerificationRequest
): Promise<PaymentVerificationResult> {
  if (!request.verifiedByUserId || !request.registrationId || !/^[A-Za-z0-9_-]{10,37}$/.test(request.transactionId || "")) return failure(400, "Invalid payment reference", "Invalid reference");
  try {
    const registration = await decideTraining({ ...request, actor: request.verifiedByUserId, approve: true, allowCreate: true });
    return { success: true, registration, message: "Payment verified" };
  } catch (error) {
    return failure(error instanceof WorkflowError ? error.status : 500, error instanceof WorkflowError ? error.message : "Payment could not be verified", "Verification failed");
  }
}

export async function getPendingRegistrations() {
  try {
    const pendingRegistrations = await prisma.trainingRegistration.findMany({
      where: {
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
          }
        }
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

// Quick verification function for admin use.
// The admin names the registration explicitly; there is no amount-based lookup.
export async function quickVerifyPayment(
  request: PaymentVerificationRequest
): Promise<PaymentVerificationResult> {
  return verifyAndProcessPayment(request);
}
