/** Fees the help pages quote. Every value comes from the pricing code or the shipping_zones table. */
export type ShippingSummary = {
  baseFee: number;
  freeFrom: number;
  convenienceFee: number;
  /** Lowest and highest shipping fee below the free-shipping threshold. Missing when the zones can't be read. */
  range?: { min: number; max: number };
};

export const rupees = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
