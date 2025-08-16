import { Product } from "@/types/product";
const shopData: Product[] = [
  {
    title: "Ganoderma lucidum",
    reviews: 15,
    price: 8,
    discountedPrice: 5,
    id: 1,
    imgs: {
      thumbnails: [
        "/images/products/ganoderma.png"
      ],
      previews: [
        "/images/products/ganoderma_sticker.png"
      ],
    },
  },
  {
    title: "Oyster Mushroom",
    reviews: 5,
    price: 5.0,
    discountedPrice: 2,
    id: 2,
    imgs: {
      thumbnails: [
        "/images/products/oyster.png",
      ],
      previews: [
        "/images/products/oyster_sticker.png",
      ],
    },
  },
  {
    title: "Lion's Mane",
    reviews: 5,
    price: 10.0,
    discountedPrice: 8.0,
    id: 3,
    imgs: {
      thumbnails: [
        "/images/products/lions_mane.png",
      ],
      previews: [
        "/images/products/lions_mane.png",
      ],
    },
  },
  {
    title: "Shitake",
    reviews: 6,
    price: 59.0,
    discountedPrice: 29.0,
    id: 4,
    imgs: {
      thumbnails: [
        "/images/products/shitake.png"
      ],
      previews: [
       "/images/products/shitake_sticker.png"
      ],
    },
  },
];

export default shopData;
