/** @jest-environment node */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { GET } from "./route";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findFirst: jest.fn() },
    shippingZone: { findFirst: jest.fn() },
    globalConfig: { findUnique: jest.fn() },
  },
}));

function quote(query: string) {
  return GET(new NextRequest("http://localhost/api/shipping/check?" + query));
}

beforeEach(() => {
  jest.clearAllMocks();
  (prisma.globalConfig.findUnique as jest.Mock).mockResolvedValue(null);
  (prisma.shippingZone.findFirst as jest.Mock).mockResolvedValue({ name: "Courier", baseFee: 10 });
});

it.each([
  ["fresh", "248001", true],
  ["fresh", "248142", true],
  ["fresh", "110001", false],
  ["national", "110001", true],
])("quotes %s products for PIN %s", async (fulfillmentClass, pincode, expected) => {
  (prisma.product.findFirst as jest.Mock).mockResolvedValue({ fulfillmentClass, title: "Mushrooms" });
  const response = await quote("pincode=" + pincode + "&subtotal=200&productId=1");
  expect(await response.json()).toMatchObject({ deliverable: expected });
});

it("continues serving existing PIN-only callers without a product query", async () => {
  const response = await quote("pincode=110001&subtotal=1999");
  expect(await response.json()).toMatchObject({ deliverable: true, freshEligible: false, shippingFee: 0 });
  expect(prisma.product.findFirst).not.toHaveBeenCalled();
});
