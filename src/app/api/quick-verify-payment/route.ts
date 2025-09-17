import { NextRequest, NextResponse } from "next/server";
import { quickVerifyPayment } from "@/lib/payment-verifier";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, amount } = body;

    if (!transactionId || !amount) {
      return NextResponse.json(
        { error: "Transaction ID and amount are required" },
        { status: 400 }
      );
    }

    const result = await quickVerifyPayment(transactionId, amount);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        registration: result.registration
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Quick verification error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
