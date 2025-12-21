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
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Calculate the correct training program price based on Early Bird availability
 * @param program The training program object
 * @returns The correct price to use (Early Bird price if available and valid, otherwise original price)
 */
export const getTrainingProgramPrice = (program: {
  hasEarlyBirdOffer: boolean;
  earlyBirdPrice?: number;
  originalPrice?: number;
  earlyBirdEndDate?: Date | string;
  price: number;
}): number => {
  // Check if Early Bird offer is available and valid
  if (program.hasEarlyBirdOffer &&
    program.earlyBirdPrice &&
    program.originalPrice &&
    program.earlyBirdEndDate) {

    const now = new Date();
    const endDate = new Date(program.earlyBirdEndDate);
    // Set to end of day to include the entire end date
    endDate.setHours(23, 59, 59, 999);

    // Check if Early Bird offer is still valid (not expired)
    if (now <= endDate) {
      return program.earlyBirdPrice;
    }
  }

  // Fall back to the original price
  return program.originalPrice || program.price;
};

/**
 * Check if Early Bird offer is currently valid for a training program
 * @param program The training program object
 * @returns True if Early Bird offer is available and valid, otherwise false
 */
export const isEarlyBirdOfferValid = (program: {
  hasEarlyBirdOffer: boolean;
  earlyBirdPrice?: number;
  originalPrice?: number;
  earlyBirdEndDate?: Date | string;
}): boolean => {
  if (!program.hasEarlyBirdOffer ||
    !program.earlyBirdPrice ||
    !program.originalPrice ||
    !program.earlyBirdEndDate) {
    return false;
  }

  const now = new Date();
  const endDate = new Date(program.earlyBirdEndDate);
  // Set to end of day to include the entire end date
  endDate.setHours(23, 59, 59, 999);

  return now <= endDate;
};