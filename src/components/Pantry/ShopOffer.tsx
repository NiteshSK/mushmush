import Link from "next/link";

type Offer = {
  title: string;
  subtitle?: string;
  description?: string;
  discount?: string;
  imageUrl: string;
  bgColor: string;
  textColor: string;
  buttonText: string;
  buttonLink?: string;
  product?: { slug: string };
  category?: { slug: string };
};
export function ShopOffer({ offer, preview = false }: { offer: Offer; preview?: boolean }) {
  const url =
    offer.buttonLink ||
    (offer.product
      ? "/shop-details/" + offer.product.slug
      : offer.category
        ? "/shop?category=" + offer.category.slug
        : "/shop");
  const link = /^\/(?![\\/])/.test(url) || /^https?:\/\//i.test(url) ? url : "/shop";
  return (
    <article
      className="flex flex-wrap items-center justify-between gap-4 rounded-xl p-5 sm:p-8"
      style={{ backgroundColor: offer.bgColor, color: offer.textColor }}
    >
      <div className="min-w-0 flex-1 space-y-2" style={{ flexBasis: "15rem" }}>
        {offer.subtitle && <p className="text-sm">{offer.subtitle}</p>}
        <h2 className="text-xl font-semibold break-words">{offer.title}</h2>
        {offer.discount && <p className="font-semibold">{offer.discount}</p>}
        {offer.description && <p>{offer.description}</p>}
        {preview ? (
          <span className="inline-block underline">{offer.buttonText}</span>
        ) : (
          <Link href={link} className="inline-block underline">
            {offer.buttonText}
          </Link>
        )}
      </div>
      <img
        loading="lazy"
        alt=""
        src={offer.imageUrl}
        className="h-24 w-32 max-w-full rounded-lg object-cover"
      />
    </article>
  );
}
