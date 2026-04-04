import {
  toBaseUnits,
  formatBulkQuantity,
  availablePacks,
  packsToBulk,
} from '../inventory';

describe('inventory helpers', () => {
  // ─── toBaseUnits ──────────────────────────────────────────

  describe('toBaseUnits', () => {
    it('converts kg to grams', () => {
      expect(toBaseUnits(50, 'kg')).toBe(50000);
      expect(toBaseUnits(1.5, 'kg')).toBe(1500);
    });

    it('keeps gm as-is', () => {
      expect(toBaseUnits(100, 'gm')).toBe(100);
      expect(toBaseUnits(250, 'g')).toBe(250);
    });

    it('converts litres to ml', () => {
      expect(toBaseUnits(2, 'L')).toBe(2000);
      expect(toBaseUnits(0.5, 'litre')).toBe(500);
      expect(toBaseUnits(3, 'litres')).toBe(3000);
    });

    it('keeps ml as-is', () => {
      expect(toBaseUnits(500, 'ml')).toBe(500);
    });

    it('returns value unchanged for unknown units', () => {
      expect(toBaseUnits(10, 'pieces')).toBe(10);
    });
  });

  // ─── formatBulkQuantity ───────────────────────────────────

  describe('formatBulkQuantity', () => {
    it('formats large gram values as kg', () => {
      expect(formatBulkQuantity(50000, 'gm')).toBe('50 kg');
      expect(formatBulkQuantity(1500, 'gm')).toBe('1.50 kg');
    });

    it('formats small gram values as gm', () => {
      expect(formatBulkQuantity(500, 'gm')).toBe('500 gm');
    });

    it('formats large ml values as L', () => {
      expect(formatBulkQuantity(2000, 'ml')).toBe('2 L');
      expect(formatBulkQuantity(1500, 'ml')).toBe('1.50 L');
    });

    it('formats small ml values as ml', () => {
      expect(formatBulkQuantity(100, 'ml')).toBe('100 ml');
    });

    it('formats zero correctly', () => {
      expect(formatBulkQuantity(0, 'gm')).toBe('0 gm');
      expect(formatBulkQuantity(0, 'ml')).toBe('0 ml');
    });
  });

  // ─── availablePacks ───────────────────────────────────────

  describe('availablePacks', () => {
    it('calculates packs for gm-based products', () => {
      // 50kg stock, 100gm per pack → 500 packs
      expect(availablePacks(50000, 100, 'gm')).toBe(500);
    });

    it('calculates packs for kg-based products', () => {
      // 15000gm stock, 3kg per pack → 5 packs
      expect(availablePacks(15000, 3, 'kg')).toBe(5);
    });

    it('calculates packs for ml-based products', () => {
      // 1000ml stock, 10ml per pack → 100 packs
      expect(availablePacks(1000, 10, 'ml')).toBe(100);
    });

    it('floors partial packs', () => {
      // 550gm stock, 200gm per pack → 2 packs (not 2.75)
      expect(availablePacks(550, 200, 'gm')).toBe(2);
    });

    it('returns 0 when stock is less than one pack', () => {
      expect(availablePacks(50, 100, 'gm')).toBe(0);
    });

    it('returns 0 for zero stock', () => {
      expect(availablePacks(0, 100, 'gm')).toBe(0);
    });

    it('returns 0 for zero measurement value', () => {
      expect(availablePacks(1000, 0, 'gm')).toBe(0);
    });
  });

  // ─── packsToBulk ──────────────────────────────────────────

  describe('packsToBulk', () => {
    it('converts packs to grams for gm products', () => {
      // 3 packs of 100gm = 300gm
      expect(packsToBulk(3, 100, 'gm')).toBe(300);
    });

    it('converts packs to grams for kg products', () => {
      // 2 packs of 3kg = 6000gm
      expect(packsToBulk(2, 3, 'kg')).toBe(6000);
    });

    it('converts packs to ml for ml products', () => {
      // 5 packs of 10ml = 50ml
      expect(packsToBulk(5, 10, 'ml')).toBe(50);
    });
  });
});
