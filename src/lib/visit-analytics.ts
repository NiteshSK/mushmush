export const VISIT_CONSENT = "kosvana_visit_analytics";
export const VISIT_PREFERENCE_EVENT = "kosvana:visit-preference";
export const VISIT_ACTIVITY_EVENT = "kosvana:visit-activity";
export const VISIT_IDLE_MINUTES = 30;
export const VISIT_RETENTION_DAYS = 90;
export const MAX_VISIT_EVENTS = 500;

export const VISIT_EVENT_LABELS = {
  page: "Viewed page",
  shop_filter: "Changed the shop view",
  bag_add: "Added to bag",
  bag_open: "Opened bag",
  gallery: "Viewed product photo",
  product_info: "Opened product information",
  delivery_check: "Opened delivery check",
  checkout_code: "Reached checkout verification",
  checkout_payment: "Reached UPI payment",
  payment_submitted: "Submitted UPI payment for review",
  presence: "Active on page",
} as const;

export type VisitEventKind = keyof typeof VISIT_EVENT_LABELS;
export type VisitAction = Exclude<VisitEventKind, "page" | "presence">;
export const VISIT_SOURCES = ["direct", "search", "social", "referral"] as const;
export type VisitSource = typeof VISIT_SOURCES[number];

const pages = new Set([
  "/", "/shop", "/shop-details", "/search", "/cart", "/checkout", "/wishlist", "/recently-viewed",
  "/blogs", "/news", "/training", "/about-us", "/contact", "/faqs", "/terms", "/privacy",
  "/auth/signin", "/auth/signup",
]);
const slug = /^[a-z0-9](?:[a-z0-9_-]{0,110}[a-z0-9])?$/i;
const uuid = /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i;
const shopCategories = new Set(["spices", "dry-fruits", "seeds", "edible", "medicinal", "powders", "tinctures"]);

export function visitShopContext(search: string) {
  const source = new URLSearchParams(search);
  const clean = new URLSearchParams();
  const categories = (source.get("category") ?? "").split(",").filter(value => shopCategories.has(value));
  if (categories.length) clean.set("category", Array.from(new Set(categories)).join(","));
  const sort = source.get("sort") ?? "";
  if (["price-low", "price-high", "name"].includes(sort)) clean.set("sort", sort);
  const page = Number(source.get("page"));
  if (Number.isInteger(page) && page > 1 && page < 1000) clean.set("page", String(page));
  return clean.toString().replace(/%2C/g, ",");
}

export function visitPath(pathname: string): string | null {
  const path = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  if (pages.has(path)) return path;
  const [, section, name, suffix, extra] = path.split("/");
  if (!path.startsWith("/") || !name || !slug.test(name) || extra !== undefined) return null;
  const articleOrProduct = ["shop-details", "blogs", "news"].includes(section) && suffix === undefined;
  const training = section === "training" && (suffix === undefined || suffix === "schedule");
  return articleOrProduct || training ? path : null;
}

export function visitSource(referrer: string, origin: string): VisitSource {
  try {
    const source = new URL(referrer);
    if (!["https:", "http:"].includes(source.protocol) || source.origin === origin) return "direct";
    if (/^(?:(?:www|images)\.)?google\.(?:com|co\.in|[a-z]{2})$|(?:^|\.)(?:bing\.com|duckduckgo\.com|search\.yahoo\.com)$/i.test(source.hostname)) return "search";
    if (/(?:^|\.)(?:facebook\.com|instagram\.com|youtube\.com|youtu\.be|pinterest\.com|linkedin\.com|reddit\.com|x\.com|t\.co|twitter\.com)$/i.test(source.hostname)) return "social";
    return "referral";
  } catch { return "direct"; }
}

export function browserBlocksVisits() {
  const browser = navigator as Navigator & { globalPrivacyControl?: boolean };
  return browser.globalPrivacyControl === true || browser.doNotTrack === "1";
}

export function analyticsConsent() {
  if (browserBlocksVisits()) return "blocked";
  try {
    const preference = localStorage.getItem(VISIT_CONSENT);
    if (preference === "allow" || preference === "decline") return preference;
  } catch { return "blocked"; }
  return "unset";
}

export function setAnalyticsConsent(allow: boolean) {
  const granted = allow && !browserBlocksVisits();
  try { localStorage.setItem(VISIT_CONSENT, granted ? "allow" : "decline"); } catch { return; }
  document.cookie = VISIT_CONSENT + (granted ? "=allow; Max-Age=31536000" : "=; Max-Age=0") +
    "; Path=/; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : "");
  window.dispatchEvent(new Event(VISIT_PREFERENCE_EVENT));
}

export function trackVisitAction(kind: VisitAction, detail?: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(VISIT_ACTIVITY_EVENT, { detail: { kind, detail } }));
}

export function visitEvent(value: unknown, now = Date.now()) {
  if (!value || typeof value !== "object") return null;
  const { id, sequence, kind, path, detail, at, source } = value as Record<string, unknown>;
  if (typeof id !== "string" || !uuid.test(id) || typeof sequence !== "number" ||
    !Number.isInteger(sequence) || sequence < 1 || sequence > MAX_VISIT_EVENTS ||
    typeof kind !== "string" || !Object.hasOwn(VISIT_EVENT_LABELS, kind) ||
    typeof path !== "string" || path.length > 150 || visitPath(path) !== path ||
    typeof at !== "number" || !Number.isSafeInteger(at) || at < now - 5 * 60_000 || at > now + 30_000 ||
    typeof source !== "string" || !VISIT_SOURCES.includes(source as VisitSource)) return null;

  const eventKind = kind as VisitEventKind;
  let safeDetail: string | null = null;
  if (eventKind === "bag_add" && typeof detail === "string" && slug.test(detail)) safeDetail = detail;
  if (eventKind === "gallery" && typeof detail === "string" && /^[1-9]\d?$/.test(detail) && path.startsWith("/shop-details/")) safeDetail = detail;
  if (eventKind === "product_info" && (detail === "overview" || detail === "care") && path.startsWith("/shop-details/")) safeDetail = detail;
  if ((eventKind === "page" || eventKind === "shop_filter") && path === "/shop" && typeof detail === "string") {
    safeDetail = visitShopContext(detail) || null;
  }
  if (eventKind === "shop_filter" && path !== "/shop") return null;
  if (["checkout_code", "checkout_payment", "payment_submitted"].includes(eventKind) && path !== "/checkout") return null;
  if ((eventKind === "gallery" || eventKind === "product_info") && !safeDetail) return null;
  return { id, sequence, kind: eventKind, path, detail: safeDetail, at: new Date(Math.min(at, now)), source: source as VisitSource };
}
