/**
 * Inventory helpers for bulk quantity management.
 *
 * `quantity` on Product stores total stock in **base units**:
 *   - grams  for weight-based products (gm, kg)
 *   - ml     for volume-based products  (ml, L)
 *
 * Each product's `measurementValue` + `measurementType` defines the
 * size of one sellable pack (e.g. 100 gm = one pack).
 */

/** Convert an admin-entered value + unit into base units (grams or ml). */
export function toBaseUnits(value: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case 'kg':
      return value * 1000;      // kg → grams
    case 'gm':
    case 'g':
      return value;             // already grams
    case 'l':
    case 'litre':
    case 'litres':
      return value * 1000;      // litres → ml
    case 'ml':
      return value;             // already ml
    default:
      return value;             // fallback: treat as base unit
  }
}

/** Convert base units back to a human-friendly display string. */
export function formatBulkQuantity(baseUnits: number, measurementType: string): string {
  const isVolume = ['ml', 'l', 'litre', 'litres'].includes(measurementType.toLowerCase());

  if (isVolume) {
    if (baseUnits >= 1000) {
      const litres = baseUnits / 1000;
      return litres % 1 === 0 ? `${litres} L` : `${litres.toFixed(2)} L`;
    }
    return `${baseUnits} ml`;
  } else {
    if (baseUnits >= 1000) {
      const kg = baseUnits / 1000;
      return kg % 1 === 0 ? `${kg} kg` : `${kg.toFixed(2)} kg`;
    }
    return `${baseUnits} gm`;
  }
}

/**
 * How many sellable packs can be made from the bulk stock?
 *
 * `quantity`         – total stock in base units (grams or ml)
 * `measurementValue` – size of one pack in its own unit
 * `measurementType`  – unit of measurementValue (gm, kg, ml, etc.)
 */
export function availablePacks(
  quantity: number,
  measurementValue: number,
  measurementType: string
): number {
  const packSizeInBase = toBaseUnits(measurementValue, measurementType);
  if (packSizeInBase <= 0) return 0;
  return Math.floor(quantity / packSizeInBase);
}

/**
 * How many base units to subtract from `quantity` when N packs are ordered.
 */
export function packsToBulk(
  packs: number,
  measurementValue: number,
  measurementType: string
): number {
  return packs * toBaseUnits(measurementValue, measurementType);
}

/**
 * Atomically decrement stock for order items after payment confirmation.
 * Uses raw SQL with `WHERE quantity >= X` to prevent race conditions.
 * Returns { success, failedItems } — if any item can't be fulfilled,
 * NO stock is touched (all-or-nothing via transaction).
 */
export async function decrementStockAtomic(
  prisma: any,
  orderItems: { productId: number; quantity: number }[]
): Promise<{ success: boolean; failedItems: string[] }> {
  // First, fetch all products to calculate bulk amounts
  const productIds = orderItems.map(i => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true, quantity: true, measurementValue: true, measurementType: true },
  });

  // Pre-validate: check if all items have enough stock
  const failedItems: string[] = [];
  const decrements: { productId: number; bulkAmount: number; title: string; remainingAfter: number }[] = [];

  for (const item of orderItems) {
    const product = products.find((p: any) => p.id === item.productId);
    if (!product) {
      failedItems.push(`Product ID ${item.productId} not found`);
      continue;
    }
    const bulkAmount = packsToBulk(item.quantity, product.measurementValue, product.measurementType);
    if (product.quantity < bulkAmount) {
      const packs = availablePacks(product.quantity, product.measurementValue, product.measurementType);
      failedItems.push(`"${product.title}" — only ${packs} pack(s) available, ${item.quantity} requested`);
    } else {
      decrements.push({
        productId: product.id,
        bulkAmount,
        title: product.title,
        remainingAfter: product.quantity - bulkAmount,
      });
    }
  }

  if (failedItems.length > 0) {
    return { success: false, failedItems };
  }

  // Atomic decrement in a transaction using raw SQL for race-condition safety
  await prisma.$transaction(async (tx: any) => {
    for (const dec of decrements) {
      // Atomic: only decrements if quantity >= bulkAmount (prevents going negative)
      const result = await tx.$executeRaw`
        UPDATE products
        SET quantity = quantity - ${dec.bulkAmount},
            "updatedAt" = NOW()
        WHERE id = ${dec.productId}
          AND quantity >= ${dec.bulkAmount}
      `;

      if (result === 0) {
        // Race condition: someone else took the stock between our check and update
        throw new Error(`Insufficient stock for "${dec.title}" — please try again`);
      }

      // Auto-mark out of stock if remaining can't fill 1 pack
      const packSize = dec.bulkAmount / (orderItems.find(i => i.productId === dec.productId)?.quantity || 1);
      if (dec.remainingAfter < packSize) {
        await tx.$executeRaw`
          UPDATE products
          SET "inStock" = false,
              quantity = GREATEST(quantity, 0),
              "updatedAt" = NOW()
          WHERE id = ${dec.productId}
        `;
        // Product auto-marked out of stock
      }
    }
  });

  return { success: true, failedItems: [] };
}
