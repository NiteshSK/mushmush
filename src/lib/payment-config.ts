/**
 * Centralized UPI Payment Configuration
 *
 * All UPI payment details are managed here. To change VPA/UPI ID,
 * update the environment variables:
 *   - NEXT_PUBLIC_UPI_VPA: The UPI VPA (e.g., merchant@upi)
 *   - NEXT_PUBLIC_UPI_MERCHANT_NAME: Display name for the merchant
 */

export const UPI_CONFIG = {
  /** UPI VPA / ID — set via NEXT_PUBLIC_UPI_VPA env var */
  vpa: process.env.NEXT_PUBLIC_UPI_VPA || 'pravesh.rawat340-2@oksbi',
  /** Merchant display name */
  merchantName: process.env.NEXT_PUBLIC_UPI_MERCHANT_NAME || 'Pravesh Rawat',
  /** Currency */
  currency: 'INR',
} as const;

/**
 * Generate a UPI deep link for payment
 */
export function generateUPILink(params: {
  amount: number;
  note: string;
}): string {
  return `upi://pay?pa=${UPI_CONFIG.vpa}&pn=${encodeURIComponent(UPI_CONFIG.merchantName)}&am=${params.amount}&cu=${UPI_CONFIG.currency}&tn=${encodeURIComponent(params.note)}`;
}
