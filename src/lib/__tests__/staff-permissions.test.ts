import { canWork, pageDuties, readGrant } from "../staff-permissions";

describe("staff permissions", () => {
  const finance = { role: "STAFF", staffDuties: ["finance"] };
  it("keeps duties independent and grants an owner access across desks", () => {
    expect(canWork(finance, ...pageDuties("/admin/orders?status=PAYMENT_RECEIVED"))).toBe(true);
    expect(canWork(finance, ...pageDuties("/admin/payment-verification"))).toBe(true);
    expect(canWork(finance, ...pageDuties("/admin/users"))).toBe(false);
    expect(canWork(finance, ...pageDuties("/admin/operations"))).toBe(false);
    expect(canWork(finance, ...pageDuties("/admin/inventory"))).toBe(false);
    expect(canWork({ role: "ADMIN" }, ...pageDuties("/admin/users"))).toBe(true);
  });
  it("defaults new and unrecognized routes to owner access", () => {
    expect(pageDuties("/admin/new-feature")).toEqual(["owner"]);
    expect(canWork({role:"CUSTOMER", staffDuties:["finance"]}, "finance")).toBe(false);
    expect(canWork({role:"STAFF", staffDuties:["owner"]}, "owner")).toBe(false);
  });
  it("validates staff grants and clears old duties on reassignment", () => {
    expect(readGrant("STAFF", [])).toBeNull();
    expect(readGrant("STAFF", ["owner"])).toBeNull();
    expect(readGrant("GUEST", [])).toBeNull();
    expect(readGrant("STAFF", ["trainer","finance","finance"])).toEqual({role:"STAFF",staffDuties:["trainer","finance"]});
    expect(readGrant("CUSTOMER", ["finance"])).toEqual({role:"CUSTOMER",staffDuties:[]});
  });
});
