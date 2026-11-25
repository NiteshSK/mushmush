"use client";
import { usePromotionalBanners } from "@/hooks/usePromotionalBanners";
import { ShopOffer } from "./ShopOffer";

export default function ShopOffers() {
  const { banners } = usePromotionalBanners();
  if (!banners.length) return null;
  return (
    <section aria-label="Pantry offers" className="mx-auto w-full max-w-7xl px-4 py-6 space-y-4">
      {banners.map((offer) => (
        <ShopOffer key={offer.id} offer={offer} />
      ))}
    </section>
  );
}
