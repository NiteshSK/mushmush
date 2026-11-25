/** Helpers shared by the journal (/blogs) and news (/news) pages. They are pure, so pages and tests can use them. */

export const PAGE_SIZE = 6;

/** Reads `?page=` and falls back to the first page for anything that is not a positive whole number. */
export function pageNumber(raw: string | string[] | undefined) {
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(value) && value > 0 ? value : 1;
}

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

/** "21 September 2025", in Indian time so the date matches what the shop in Herbertpur published. */
export const formatDate = (date: Date | string) => dateFormat.format(new Date(date));
export const isoDate = (date: Date | string) => new Date(date).toISOString();

/** Stored image paths come as "/images/…", "images/…", "public/images/…" or full URLs. Returns null when there is no image. */
export function imageSrc(img: string | null | undefined) {
  const src = img?.trim();
  if (!src) return null;
  if (src.startsWith("public/")) return src.slice(6);
  return src.startsWith("/") || /^https?:\/\//.test(src) ? src : `/${src}`;
}

/**
 * Scraped headlines arrive as "Headline - Publisher". Splits off the publisher so it can be credited
 * separately. Titles without a publisher suffix come back unchanged.
 */
export function splitPublisher(title: string) {
  const at = title.lastIndexOf(" - ");
  if (at <= 0) return { headline: title, publisher: null };
  const publisher = title.slice(at + 3).trim();
  return publisher ? { headline: title.slice(0, at).trim(), publisher } : { headline: title, publisher: null };
}

export const isExternal = (url: string | null | undefined): url is string => !!url && /^https?:\/\//.test(url);

/** Mushrooms the shop search understands. The first one an article title names becomes its "search the pantry" link. */
const TOPICS = ["oyster", "shiitake", "lion’s mane", "reishi", "cordyceps", "turkey tail", "chaga", "maitake", "morel", "button", "enoki", "milky"];

const normalise = (text: string) => text.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/** Returns the mushroom an article title is about, if it names one, e.g. "shiitake". */
export function articleTopic(title: string) {
  const words = ` ${normalise(title).replace(/\bshitake\b/g, "shiitake")} `;
  return TOPICS.find(topic => words.includes(` ${normalise(topic)} `)) ?? null;
}

export const pageCount = (total: number) => Math.max(1, Math.ceil(total / PAGE_SIZE));
