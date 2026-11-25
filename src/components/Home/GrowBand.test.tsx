import { configureStore } from "@reduxjs/toolkit";
import { render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import cartReducer from "@/redux/features/cart-slice";
import { useProducts } from "@/hooks/useProducts";
import GrowBand from "./GrowBand";

jest.mock("@/hooks/useProducts", () => ({ useProducts: jest.fn() }));
jest.mock("next/image", () => ({ __esModule: true, default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} /> }));

const make = (id: number, slug: string, title: string, category: string) => ({
  id, slug, title, description: "", price: 149, discountedPrice: null, measurementValue: 1000, measurementType: "gm",
  stockQuantity: 5, inStock: true, imgs: { previews: [`/images/${slug}.png`], thumbnails: [] },
  categories: [{ category: { id, slug: category, title: category } }],
});
const show = (products: unknown[], state: { loading?: boolean; error?: string | null } = {}) => {
  (useProducts as jest.Mock).mockReturnValue({ products, loading: false, error: null, ...state });
  return render(<Provider store={configureStore({ reducer: { cartReducer } })}><GrowBand /></Provider>);
};

describe("GrowBand", () => {
  it("shows every spawn and grow bag and no other products, says they are not food, and links to bulk orders", () => {
    show([make(1, "cumin-seeds", "Cumin Seeds", "spices"), make(2, "oyster-seed-or-spawn", "Oyster Seed ('or Spawn')", "seeds"),
      make(3, "grow-bag", "Oyster Mushroom Grow Bag", "grow-your-own")]);
    const band = within(screen.getByRole("region", { name: "Grow your own." }));
    expect(band.getAllByRole("heading", { level: 3 }).map(h => h.textContent)).toEqual(["Oyster Seed ('or Spawn')", "Oyster Mushroom Grow Bag"]);
    expect(band.getByText(/Not for eating/)).toBeInTheDocument();
    expect(band.getByText("Ask about bulk spawn", { selector: "a" })).toHaveAttribute("href", "/contact?subject=Bulk%20spawn");
    expect(band.queryByText(/training|Learn to grow/i)).toBeNull();
    expect(band.getAllByText(/1 kg/).length).toBe(2);
  });

  it("renders nothing while loading, on error, or with no grow products", () => {
    const { container, unmount } = show([], { loading: true });
    expect(container).toBeEmptyDOMElement(); unmount();
    expect(show([make(2, "oyster-seed-or-spawn", "Oyster Spawn", "seeds")], { error: "down" }).container).toBeEmptyDOMElement();
  });
});
