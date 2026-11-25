import type { Product } from "@/types/product";
import { escapeHtml } from "@/lib/sanitize";
import { sentenceCase } from "../Pantry/catalogue";

type Copy = Pick<Product, "description" | "specifications" | "howToConsume" | "additionalInfo" | "benefits">;

export type InfoRow = { label: string; value: string };
export type Benefit = { label: string; text: string };

const plain = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const isStorage = (text: string) => /^(storage|shelf life|how to store)\b/i.test(text.trim());

/** Some stored copy repeats its own section title as a leading <h2>, e.g. "Specifications:". */
const dropLeadingHeading = (html: string) => html.replace(/^(\s*<div[^>]*>)?\s*<h2[^>]*>[^<]*<\/h2>/i, "$1");

function parseBenefits(raw: unknown): Benefit[] {
  let value = raw;
  if (typeof value === "string") {
    if (!value.trim()) return [];
    try { value = JSON.parse(value); } catch { return [{ label: "", text: value as string }]; }
  }
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>)
    .filter(([, text]) => typeof text === "string" && text.trim())
    .map(([key, text]) => ({ label: sentenceCase(key.replace(/([A-Z])/g, " $1").trim()), text: (text as string).trim() }));
}

/**
 * Groups the stored product copy for the product information panel.
 * Storage lines come from the "Storage" information row and the "Shelf life" specification.
 * Nothing is invented: a section without stored copy is left out.
 */
export function productSections(product: Copy) {
  const specifications = (product.specifications ?? []).filter(item => item && plain(item));
  const info = (product.additionalInfo ?? []).filter(row => row?.label && row?.value);
  const storage = [
    ...info.filter(row => isStorage(row.label)).map(row => `<strong>${escapeHtml(row.label)}:</strong> ${escapeHtml(row.value)}`),
    ...specifications.filter(item => isStorage(plain(item))),
  ];
  return {
    preparation: (product.howToConsume ?? []).filter(item => item && plain(item)).map(dropLeadingHeading),
    storage,
    description: product.description && plain(product.description) ? product.description : "",
    benefits: parseBenefits(product.benefits),
    specifications: specifications.filter(item => !isStorage(plain(item))).map(dropLeadingHeading),
    details: info.filter(row => !isStorage(row.label)),
  };
}

/** A short plain-text summary for metadata. */
export function summary(html: string, length = 155) {
  const text = plain(html ?? "");
  return text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text;
}

/** Keep the first complete sentence when it fits beside the purchase controls. */
export function productIntro(html: string) {
  const text = plain(html);
  const firstSentence = text.match(/^.*?[.!?](?=\s|$)/)?.[0];
  const limit = 155;
  if (firstSentence && firstSentence.length <= limit) return firstSentence;
  if (text.length <= limit) return text;
  const cutoff = text.lastIndexOf(" ", limit);
  return `${text.slice(0, cutoff > limit / 2 ? cutoff : limit).trimEnd()}…`;
}

/** Turns an unknown slug into search words, e.g. "cumin-seed" → "cumin seed". */
export function slugWords(slug: string) {
  let text = slug;
  try { text = decodeURIComponent(slug); } catch { /* keep the raw slug */ }
  return text.replace(/[-_]+/g, " ").replace(/[^a-z0-9 ]/gi, "").replace(/\s+/g, " ").trim().slice(0, 60);
}
