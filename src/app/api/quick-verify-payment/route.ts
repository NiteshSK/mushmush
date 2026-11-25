import { canWork } from "@/lib/staff-permissions";
import { runStaffJobs } from "@/lib/staff-jobs";
import { after, NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { quickVerifyPayment } from "@/lib/payment-verifier";

/**
 * POST /api/quick-verify-payment (ADMIN only)
 *
 * Body: { registrationId: string, transactionId: string, amount?: number }
 * Confirms ONE named registration after an admin has checked the payment.
 * The amount is only a cross-check; it is never used to find a registration.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }
    if (!canWork(session.user,"finance")) {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { registrationId, transactionId, amount } = body ?? {};

    if (!registrationId || typeof registrationId !== "string") {
      return NextResponse.json(
        { error: "registrationId is required" },
        { status: 400 }
      );
    }
    if (!transactionId || typeof transactionId !== "string") {
      return NextResponse.json(
        { error: "transactionId is required" },
        { status: 400 }
      );
    }

    const result = await quickVerifyPayment({
      registrationId,
      transactionId,
      amount,
      verifiedByUserId: session.user.id,
    });

    if (result.success) {
      after(() => runStaffJobs(registrationId));
      return NextResponse.json({
        success: true,
        message: result.message,
        registration: result.registration
      });
    }

    return NextResponse.json(
      { error: result.message, details: result.error },
      { status: result.status ?? 400 }
    );

  } catch (error) {
    console.error('Quick verification error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
