import { couponAmount } from "../coupon-amount";
import {
  indiaLocalInput,
  promotionState,
  validBanner,
} from "../promotion-schedule";

const now = Date.parse("2026-11-25T06:00:00Z");
const active = {
  isActive: true,
  startDate: "2026-11-25T06:00:00Z",
  endDate: "2026-11-25T06:00:00Z",
};

describe("staff promotion preview", () => {
  test("schedule boundaries match inclusive storefront dates", () => {
    expect(promotionState(active, now - 1)).toBe("Scheduled");
    expect(promotionState(active, now)).toBe("Live");
    expect(promotionState({ ...active, maxUses: 20, usedCount: 20 }, now)).toBe(
      "Fully redeemed",
    );
    expect(promotionState(active, now + 1)).toBe("Expired");
    expect(promotionState({ ...active, isActive: false }, now)).toBe(
      "Disabled",
    );
  });
  test("India time survives a midnight edit", () => {
    expect(indiaLocalInput("2026-11-24T18:30:00Z")).toBe("2026-11-25T00:00");
  });
  test("checkout and preview round percentage coupons and apply caps", () => {
    expect(couponAmount(149, "PERCENTAGE", 10, null)).toBe(15);
    expect(couponAmount(149, "PERCENTAGE", 10, 12)).toBe(12);
    expect(couponAmount(99, "FIXED_AMOUNT", 100, null)).toBe(99);
  });
  test("banner scheduling requires a usable destination and a valid date range", () => {
    const banner = {
      title: "Winter pantry",
      imageUrl: "/walnuts.jpg",
      buttonLink: "/shop?category=walnuts",
    };
    expect(validBanner(banner)).toBeNull();
    expect(
      validBanner({
        ...banner,
        startDate: "2026-12-25",
        endDate: "2026-11-25",
      }),
    ).toBeTruthy();
  });
});
