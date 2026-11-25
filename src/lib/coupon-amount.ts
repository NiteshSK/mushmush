/** Return the same merchandise discount in checkout and the staff basket preview. */
export function couponAmount(subtotal: number, type: string, value: number, maximum: number | null) {
  if (type !== "PERCENTAGE") return Math.min(value, subtotal);
  const amount = Math.ceil((subtotal * value) / 100);
  return maximum === null ? amount : Math.min(amount, maximum);
}
