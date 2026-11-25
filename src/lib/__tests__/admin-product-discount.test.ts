/** @jest-environment node */
import { NextRequest } from "next/server";
import { saveProductDiscount } from "../admin-product-discount";

const mockTx = {
  product: { findFirst: jest.fn() },
  productDiscount: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
};
jest.mock("@/lib/admin", () => ({ staffSession: async () => ({ user: { email: "staff@example.test" } }) }));
jest.mock("@/lib/prisma", () => ({ prisma: { $transaction: (cb: (tx: typeof mockTx) => unknown) => cb(mockTx) } }));

const startDate = "2026-12-01T00:00:00.000Z";
const endDate = "2026-12-05T00:00:00.000Z";
const body = { productId: 1, type: "PERCENTAGE", value: 10, startDate, endDate };
const submit = (input: object, id?: number) => saveProductDiscount(new NextRequest("http://localhost/api/admin/discounts", {
  method: id ? "PUT" : "POST", body: JSON.stringify(input),
}), id);
beforeEach(() => {
  jest.resetAllMocks();
  mockTx.product.findFirst.mockResolvedValue({ id: 1, price: 150, title: "Walnuts" });
});

test("scheduling checks only enabled discounts intersecting the proposed window", async () => {
  const res = await submit(body);
  expect(res.status).toBe(201);
  expect(mockTx.productDiscount.findFirst).toHaveBeenCalledWith({
    where: { productId: 1, isActive: true, startDate: { lte: new Date(endDate) }, OR: [{ endDate: null }, { endDate: { gte: new Date(startDate) } }] },
    select: { id: true },
  });
  expect(mockTx.productDiscount.create).toHaveBeenCalledTimes(1);
});

test("edits reject conflicts and exclude the record being edited", async () => {
  mockTx.productDiscount.findUnique.mockResolvedValue({ id: 7, productId: 1 });
  mockTx.productDiscount.findFirst.mockResolvedValue({ id: 4 });
  const res = await submit(body, 7);
  expect(res.status).toBe(409);
  expect(mockTx.productDiscount.findFirst.mock.calls[0][0].where.id).toEqual({ not: 7 });
  expect(mockTx.productDiscount.update).not.toHaveBeenCalled();
});

test("reversed dates are rejected before querying other offers", async () => {
  expect((await submit({ ...body, endDate: "2026-11-01" })).status).toBe(400);
  expect(mockTx.productDiscount.findFirst).not.toHaveBeenCalled();
});
