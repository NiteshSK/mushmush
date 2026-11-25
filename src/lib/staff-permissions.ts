export const DUTIES = ["finance", "fulfillment", "editor", "trainer"] as const;
export type StaffDuty = typeof DUTIES[number];
export type Duty = StaffDuty | "owner";
export type AccountRole = "CUSTOMER" | "STAFF" | "ADMIN";
export const dutyLabels: Record<StaffDuty, string> = {
  finance: "Finance", fulfillment: "Fulfillment", editor: "Publishing & promotions", trainer: "Training"
};
type Staff = { role?: string; staffDuties?: string[] } | null | undefined;

export function canWork(user: Staff, ...duties: Duty[]) {
  if (user?.role === "ADMIN") return true;
  return user?.role === "STAFF" && duties.some(duty => duty !== "owner" && user.staffDuties?.includes(duty));
}

export function pageDuties(path: string): Duty[] {
  const section = path.split("?")[0].split("/")[2] || "";
  if (!section) return [...DUTIES];
  if (section === "orders") return ["finance", "fulfillment"];
  if (["products", "inventory"].includes(section)) return ["fulfillment"];
  if (["training-programs", "training-registrations"].includes(section)) return ["trainer"];
  if (section === "payment-verification") return ["finance"];
  if (["news", "blogs", "tags", "promotional-banners", "coupons", "discounts"].includes(section)) return ["editor"];
  return ["owner"];
}

export function readGrant(role: unknown, duties: unknown): { role: AccountRole; staffDuties: StaffDuty[] } | null {
  if (role === "ADMIN" || role === "CUSTOMER") return { role, staffDuties: [] as StaffDuty[] };
  if (role !== "STAFF" || !Array.isArray(duties) || !duties.length || duties.some(value => !DUTIES.includes(value))) {
    return null;
  }
  return { role: "STAFF" as const, staffDuties: Array.from(new Set<StaffDuty>(duties)) };
}
