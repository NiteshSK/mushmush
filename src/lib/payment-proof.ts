export const RETAIL_PROOF_TYPES = ["image/jpeg", "image/png", "application/pdf"];
export const RETAIL_PROOF_HINT = "JPG, PNG or PDF, up to 2 MB.";

export function acceptsRetailProof(file: Pick<File, "type" | "size">) {
  return RETAIL_PROOF_TYPES.includes(file.type) && file.size <= 2 * 1024 * 1024;
}
