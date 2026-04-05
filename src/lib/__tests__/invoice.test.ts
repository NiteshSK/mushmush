/**
 * Unit tests for invoice number generation
 */
import { generateInvoiceNumber } from "../invoice";

describe("Invoice", () => {
  describe("generateInvoiceNumber", () => {
    it("starts with INV- prefix", () => {
      const num = generateInvoiceNumber();
      expect(num).toMatch(/^INV-/);
    });

    it("contains date in YYYYMMDD format", () => {
      const num = generateInvoiceNumber();
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const d = String(today.getDate()).padStart(2, "0");
      expect(num).toContain(`${y}${m}${d}`);
    });

    it("has format INV-YYYYMMDD-XXXXX", () => {
      const num = generateInvoiceNumber();
      expect(num).toMatch(/^INV-\d{8}-[A-Z0-9]{5}$/);
    });

    it("generates unique numbers", () => {
      const numbers = new Set<string>();
      for (let i = 0; i < 100; i++) {
        numbers.add(generateInvoiceNumber());
      }
      // Should have at least 95 unique (randomness allows rare collisions)
      expect(numbers.size).toBeGreaterThanOrEqual(95);
    });
  });
});
