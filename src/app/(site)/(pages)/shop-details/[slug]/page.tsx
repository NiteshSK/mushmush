import type { Metadata } from "next";
import ShopDetails from "@/components/ShopDetails";
import PantryShell from "@/components/Pantry/PantryShell";
import { summary } from "@/components/ShopDetails/content";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ slug: string }> };

const fallback: Metadata = { title: "Shop the pantry | Kosvana" };
// Metadata must not hold back the page: the product itself loads in the browser from /api/products.
const METADATA_WAIT_MS = 2000;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const lookup = prisma.product.findUnique({ where: { slug, archivedAt: null }, select: { title: true, description: true } });
    const timeout = new Promise<"timeout">(resolve => { timer = setTimeout(() => resolve("timeout"), METADATA_WAIT_MS); });
    const product = await Promise.race([lookup, timeout]);
    if (product === "timeout") return fallback;
    if (!product) return { title: "Product not found | Kosvana", robots: { index: false } };
    return { title: `${product.title} | Kosvana`, description: summary(product.description) || undefined };
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

export default async function ShopDetailsPage({ params }: Props) {
  const { slug } = await params;
  return (
    <PantryShell current="shop">
      <ShopDetails key={slug} slug={slug} />
    </PantryShell>
  );
}
