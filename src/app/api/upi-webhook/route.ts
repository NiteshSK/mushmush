import { decideTraining, workflowFailure } from "@/lib/staff-workflow";
import { runStaffJobs } from "@/lib/staff-jobs";
import { after, NextRequest, NextResponse } from "next/server";


import { isValidWebhookSignature } from "@/lib/webhook-signature";

/**
 * POST /api/upi-webhook
 *
 * Fails closed. A request is processed only when:
 * - UPI_WEBHOOK_SECRET is configured, and
 * - header `x-webhook-signature` is the hex HMAC-SHA256 of the raw request
 *   body with that secret (an optional `sha256=` prefix is accepted), and
 * - the payload names the registration (`registrationId`) and/or the payment
 *   record (`paymentId`). The amount is only a cross-check; it is never used
 *   to find a registration.
 *
 * Payload: { registrationId?, paymentId?, transactionId, amount, status, timestamp? }
 * (at least one of registrationId / paymentId is required)
 */

const SIGNATURE_HEADER = "x-webhook-signature";


export async function POST(request: NextRequest) {
  try {
    const secret = process.env.UPI_WEBHOOK_SECRET;
    if (!secret) {
      console.error("UPI webhook rejected: UPI_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook is not configured" },
        { status: 503 }
      );
    }

    // Verify the signature over the exact raw body before parsing it
    const rawBody = await request.text();
    if (!isValidWebhookSignature(rawBody, request.headers.get(SIGNATURE_HEADER), secret)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const { registrationId, paymentId, transactionId, amount, status } = body ?? {};

    if (!registrationId && !paymentId) {
      return NextResponse.json(
        { error: "registrationId or paymentId is required" },
        { status: 400 }
      );
    }
    if (
      (registrationId !== undefined && typeof registrationId !== "string") ||
      (paymentId !== undefined && typeof paymentId !== "string")
    ) {
      return NextResponse.json({ error: "Invalid payment reference" }, { status: 400 });
    }
    if (!transactionId || typeof transactionId !== "string" || amount === undefined || !status) {
      return NextResponse.json(
        { error: "Missing required webhook data" },
        { status: 400 }
      );
    }

    if (!["COMPLETED","SUCCESS","FAILED"].includes(status)) return NextResponse.json({ error: "Unknown status" }, { status: 400 });
    const registration = await decideTraining({ paymentId, registrationId, transactionId, amount: Number(amount), approve: status !== "FAILED", actor: "webhook", allowCreate: true });
    after(() => runStaffJobs(registration.id));
    return NextResponse.json({ success: true, registrationId: registration.id, registrationNumber: registration.registrationNumber });
  } catch (error) {
    return workflowFailure(error);
  }
}

// Health check (GET). The old challenge echo is kept for webhook setup tools.
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const challenge = searchParams.get("challenge");

  if (challenge) {
    return NextResponse.json({ challenge });
  }

  return NextResponse.json({ status: "Webhook endpoint active" });
}
