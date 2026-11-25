export const sourceNames: Record<string, string> = {
  direct: "Direct or unknown", search: "Search engine", social: "Social media", referral: "Referral",
};

const dateTime = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
});
export const formatVisitTime = (date: Date) => dateTime.format(date);

export function visitorName(visit: { id: string; user: { name: string | null; email: string } | null }) {
  return visit.user?.name || visit.user?.email || "Guest · " + visit.id.slice(0, 10);
}
