// Defines the structure for a single category item
export interface Category {
  id: number;
  title: string;
  img: string; // Changed from imageUrl to img
  path: string; // Path for navigation
}

// Array of all the shop categories
const data: Category[] = [
  {
    title: "All Mushrooms",
    id: 1,
    img: "/images/categories/mushrooms.png",
    path: "/shop-without-sidebar",
  },
  {
    title: "Edible",
    id: 2,
    img: "/images/categories/edible_mushrooms.png",
    path: "/shop-without-sidebar?category=edible",
  },
  {
    title: "Medicinal",
    id: 3,
    img: "/images/categories/medicinal_mushrooms.png",
    path: "/shop-without-sidebar?category=medicinal",
  },
  {
    title: "Tinctures",
    id: 4,
    img: "/images/categories/generic_tincture.png",
    path: "/shop-without-sidebar?category=tinctures",
  },
  {
    title: "Dry Powder",
    id: 5,
    img: "/images/categories/powders.png",
    path: "/shop-without-sidebar?category=powders",
  },
];

export default data;
