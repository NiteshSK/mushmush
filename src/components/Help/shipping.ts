import { BASE_SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { CONVENIENCE_FEE } from "@/lib/fees";
import { prisma } from "@/lib/prisma";
import type { ShippingSummary } from "./money";

/** Server only (imports Prisma): reads the active shipping zones, so a fee change in the database reaches the FAQ. */
export async function getShippingSummary(): Promise<ShippingSummary> {
  const summary: ShippingSummary = { baseFee: BASE_SHIPPING_FEE, freeFrom: FREE_SHIPPING_THRESHOLD, convenienceFee: CONVENIENCE_FEE };
  try {
    const { _min, _max } = await prisma.shippingZone.aggregate({ where: { isActive: true }, _min: { baseFee: true }, _max: { baseFee: true } });
    if (_min.baseFee != null && _max.baseFee != null) {
      summary.range = { min: BASE_SHIPPING_FEE + _min.baseFee, max: BASE_SHIPPING_FEE + _max.baseFee };
    }
  } catch (error) {
    console.error("Help pages: could not read shipping zones", error);
  }
  return summary;
}
