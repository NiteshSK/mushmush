import { NextRequest, NextResponse } from "next/server";
import { staffSession } from "@/lib/admin";
import {
  priceOrder,
  pricingBreakdown,
  pricingErrorBody,
} from "@/lib/order-pricing";

export async function POST(request: NextRequest) {
  if (!(await staffSession("owner")))
    return NextResponse.json(
      { error: "Owner access required." },
      { status: 403 },
    );
  const { pincode, items } = await request.json();
  const result = await priceOrder({ pincode, items });
  if (result.ok === false)
    return NextResponse.json(pricingErrorBody(result), {
      status: result.status,
    });
  return NextResponse.json(pricingBreakdown(result.pricing));
}
