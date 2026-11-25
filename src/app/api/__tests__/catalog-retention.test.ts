/** @jest-environment node */
import { NextRequest } from "next/server";
import { staffSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { DELETE as archive, PUT as editProduct } from "../products/[id]/route";
import { POST as sharedCreate } from "../promotional-banners/route";
import { POST as staffCreate } from "../admin/promotional-banners/route";

jest.mock("@/lib/admin", () => ({ staffSession: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: { product: { update: jest.fn() } },
}));
jest.mock("@/lib/notifications", () => ({
  triggerRestockNotifications: jest.fn(),
}));

test("retiring a product archives the row without touching historical order items", async () => {
  jest
    .mocked(staffSession)
    .mockResolvedValue({
      user: { id: "staff", role: "ADMIN" },
      expires: "2100-01-01",
    });
  const res = await archive(
    new NextRequest("http://localhost/api/products/14"),
    { params: Promise.resolve({ id: "14" }) },
  );
  expect(res.status).toBe(200);
  expect(prisma.product.update).toHaveBeenCalledWith({
    where: { id: 14 },
    data: { archivedAt: expect.any(Date), featured: false, inStock: false },
  });
});

test("the shared marketing writer delegates to the protected staff action", () => {
  expect(sharedCreate).toBe(staffCreate);
});

test("the product editor routes inventory-only changes to the audited stock workflow", async () => {
  const request = new NextRequest("http://localhost/api/products/14", { method: "PUT", body: JSON.stringify({ inStock: true }) });
  jest.mocked(staffSession).mockResolvedValue({ user: { id: "staff", role: "ADMIN" }, expires: "2100-01-01" });
  const result = await editProduct(request, { params: Promise.resolve({ id: "14" }) });
  expect(result.status).toBe(400);
  expect((await result.json()).error).toContain("Inventory");
});
