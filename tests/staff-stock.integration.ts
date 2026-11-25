// Run with DATABASE_URL and DIRECT_URL pointing to a migrated disposable PostgreSQL database.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "../src/lib/prisma";
import { changeInventory } from "../src/lib/staff-inventory";

async function main() {
  const url = new URL(process.env.DATABASE_URL || "");
  if (
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    !url.pathname.endsWith("_inventory_test")
  ) {
    throw new Error(
      "This fixture requires a local disposable database ending in _inventory_test.",
    );
  }
  const sku = await prisma.product.create({
    data: {
      title: "Test dried mushrooms",
      slug: "stock-" + randomUUID(),
      description: "Fixture",
      price: 240,
      measurementValue: 100,
      measurementType: "gm",
      quantity: 1000,
      inStock: true,
      imgs: {},
      specifications: [],
      howToConsume: [],
      additionalInfo: [],
    },
  });
  const move = (
    action: "stocktake" | "receive" | "damage",
    value: number,
    movementId = randomUUID(),
    expected = sku.updatedAt.toISOString(),
  ) =>
    changeInventory(
      sku.id,
      {
        field: "quantity",
        action,
        value,
        expectedQuantity: sku.quantity,
        expectedUpdatedAt: expected,
        reason: "Fixture count",
        movementId,
      },
      "test-staff",
    );
  const duplicate = randomUUID();
  await Promise.all([
    move("receive", 200, duplicate),
    move("receive", 200, duplicate),
  ]);
  assert.equal(
    (await prisma.product.findUniqueOrThrow({ where: { id: sku.id } }))
      .quantity,
    1200,
  );
  await Promise.all([move("damage", 100), move("receive", 300)]);
  assert.equal(
    (await prisma.product.findUniqueOrThrow({ where: { id: sku.id } }))
      .quantity,
    1400,
  );
  await assert.rejects(() => move("stocktake", 900), /Stock changed/);
  await assert.rejects(() => move("damage", 1900), /less than zero/);
  await assert.rejects(
    () => move("receive", 400, duplicate),
    /another adjustment/,
  );
  await assert.rejects(
    () =>
      changeInventory(
        sku.id,
        {
          field: "price",
          value: 100,
          expectedUpdatedAt: sku.updatedAt.toISOString(),
        },
        "test-staff",
      ),
    /Reload/,
  );
  assert.equal(
    await prisma.staffEvent.count({
      where: { recordId: String(sku.id), resource: "stock" },
    }),
    3,
  );
  console.log(
    "Passed duplicate receipts, concurrent damage and receipt, stale count, insufficient stock, conflicting replay, stale price and audit history.",
  );
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
