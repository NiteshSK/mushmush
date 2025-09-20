/**
 * Generate a URL-friendly slug from a given string
 * @param text The input text to convert to a slug
 * @returns A URL-friendly slug string
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim(); // Remove leading/trailing hyphens
};
