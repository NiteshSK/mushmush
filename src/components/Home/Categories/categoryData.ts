// Defines the structure for a single category item
export interface Category {
  id: number;
  title: string;
  img: string; // Changed from imageUrl to img
  path: string; // Path for navigation
}

// Array of all the shop categories
export const categoryData: Category[] = [
  {
    title: "All Mushrooms",
    id: 1,
    img: "/images/categories/mushrooms.png",
    path: "/shop",
  },
  {
    title: "Edible Mushrooms",
    id: 2,
    img: "/images/categories/edible_mushrooms.png",
    path: "/shop?category=edible",
  },
  {
    title: "Medicinal Mushrooms",
    id: 3,
    img: "/images/categories/medicinal_mushrooms.png",
    path: "/shop?category=medicinal",
  },
  {
    title: "Tinctures",
    id: 4,
    img: "/images/categories/generic_tincture.png",
    path: "/shop?category=tinctures",
  },
  {
    title: "Dry Powder",
    id: 5,
    img: "/images/categories/powders.png",
    path: "/shop?category=powders",
  },
];

export default categoryData;
