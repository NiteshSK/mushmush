export function promotionState(
  offer: {
    isActive: boolean;
    maxUses?: number | null;
    usedCount?: number;
    startDate?: string | Date | null;
    endDate?: string | Date | null;
  },
  now = Date.now(),
) {
  if (!offer.isActive) return "Disabled";
  if (offer.startDate && new Date(offer.startDate).getTime() > now)
    return "Scheduled";
  if (offer.endDate && new Date(offer.endDate).getTime() < now)
    return "Expired";
  if (offer.maxUses != null && (offer.usedCount ?? 0) >= offer.maxUses)
    return "Fully redeemed";
  return "Live";
}

export function indiaLocalInput(value: string) {
  return new Date(new Date(value).getTime() + 330 * 60000)
    .toISOString()
    .slice(0, 16);
}
export function validBanner(input: {
  title?: string;
  imageUrl?: string;
  buttonLink?: string;
  startDate?: string;
  endDate?: string;
  priority?: string | number;
}) {
  if (
    !input ||
    typeof input.title !== "string" ||
    !input.title.trim() ||
    typeof input.imageUrl !== "string" ||
    !input.imageUrl.trim()
  )
    return "Enter a title and an image.";
  const safe = (url: string) =>
    /^\/(?![\\/])/.test(url) || /^https?:\/\//i.test(url);
  if (!safe(input.imageUrl) || (input.buttonLink && !safe(input.buttonLink)))
    return "Use a site path or an HTTP(S) URL.";
  const start = input.startDate
    ? new Date(input.startDate).getTime()
    : Date.now();
  const end = input.endDate ? new Date(input.endDate).getTime() : Infinity;
  if (!Number.isFinite(start) || Number.isNaN(end) || end < start)
    return "Choose an end after the start.";
  if (
    input.priority !== undefined &&
    !Number.isSafeInteger(Number(input.priority))
  )
    return "Use a whole number for priority.";
  return null;
}
