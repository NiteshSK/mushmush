import { visitEvent, visitPath, visitShopContext, visitSource } from "../visit-analytics";

const now = new Date("2026-11-25T12:00:00Z").getTime();
const event = (extra: Record<string, unknown> = {}) => ({
  id: "75d05096-5828-44ae-9c4f-e9848d2c61f8", sequence: 1, kind: "page", path: "/", at: now, source: "direct", ...extra,
});

it("keeps storefront paths and excludes account, recovery and order tracking data", () => {
  expect(visitPath("/shop-details/dried-apricots/")).toBe("/shop-details/dried-apricots");
  expect(visitPath("/training/oyster-cultivation/schedule")).toBe("/training/oyster-cultivation/schedule");
  for (const path of ["/track", "/orders", "/auth/reset-password", "/admin", "/search?q=private", "/news/a@email.com", "/shop-details/a/b"]) {
    expect(visitPath(path)).toBeNull();
    expect(visitEvent(event({ path }), now)).toBeNull();
  }
});

it("only records allowlisted shop filters and discards arbitrary details", () => {
  expect(visitShopContext("?category=spices,edible,example@email.com,spices&sort=name&page=2&code=abc"))
    .toBe("category=spices,edible&sort=name&page=2");
  expect(visitEvent(event({ path: "/search", detail: "search=someone@example.com" }), now)?.detail).toBeNull();
  expect(visitEvent(event({ kind: "delivery_check", detail: "248001" }), now)?.detail).toBeNull();
  expect(visitEvent(event({ kind: "payment_submitted", path: "/checkout", detail: "UPI reference" }), now)?.detail).toBeNull();
  expect(visitEvent(event({ kind: "product_info", path: "/shop-details/cumin", detail: "care" }), now)?.detail).toBe("care");
});

it("rejects events with unsupported actions, time windows or visit identifiers", () => {
  expect(visitEvent(event({ kind: "constructor" }), now)).toBeNull();
  expect(visitEvent(event({ kind: "checkout_payment" }), now)).toBeNull();
  expect(visitEvent(event({ kind: "gallery", path: "/shop-details/cumin", detail: "invalid" }), now)).toBeNull();
  expect(visitEvent(event({ at: now + 5 * 60_000 }), now)).toBeNull();
  expect(visitEvent(event({ id: "some-id" }), now)).toBeNull();
  expect(visitEvent(event({ sequence: 501 }), now)).toBeNull();
});

it("summarizes traffic sources without retaining the referring URL", () => {
  expect(visitSource("https://www.google.co.in/search?q=someone", "https://shop.test")).toBe("search");
  expect(visitSource("https://www.instagram.com/profile", "https://shop.test")).toBe("social");
  expect(visitSource("https://another.test/account", "https://shop.test")).toBe("referral");
  expect(visitSource("https://shop.test/home", "https://shop.test")).toBe("direct");
});
