import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import cartReducer from "@/redux/features/cart-slice";
import { useProducts } from "@/hooks/useProducts";
import Shop from "./index";

const push = jest.fn();
let query = "";
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/shop",
  useSearchParams: () => new URLSearchParams(query),
}));
jest.mock("@/hooks/useProducts", () => ({ useProducts: jest.fn() }));
// The shared jest setup drops every Link prop except href; keep aria attributes for these tests.
jest.mock("next/link", () => ({ __esModule: true, default: ({ children, href, scroll: _scroll, ...rest }: { children: React.ReactNode; href: string; scroll?: boolean }) => <a href={href} {...rest}>{children}</a> }));
jest.mock("next/image", () => ({ __esModule: true, default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} /> }));
jest.mock("../NotifyMeModal", () => ({ __esModule: true, default: ({ productTitle }: { productTitle: string }) => <div role="dialog">Notify me about {productTitle}</div> }));

const titles = { spices: "Spices", seeds: "Seeds", "dry-fruits": "Dry Fruits", edible: "Edible Mushrooms" } as const;
let nextId = 1;
const make = (slug: string, title: string, category: keyof typeof titles, extra = {}) => ({
  id: nextId++, slug, title, description: "", price: 149, discountedPrice: null, measurementValue: 200, measurementType: "gm",
  stockQuantity: 50, inStock: true, imgs: { previews: [`/images/${slug}.png`], thumbnails: [] },
  categories: [{ category: { id: 1, slug: category, title: titles[category] } }], ...extra,
});
const catalogue = [
  make("cumin-seeds", "Cumin Seeds", "spices"),
  make("black-pepper", "Black Pepper", "spices", { price: 199 }),
  make("chia-seeds", "Chia Seeds", "seeds", { price: 249 }),
  make("premium-walnuts", "Premium Walnuts", "dry-fruits", { price: 449, discountedPrice: 399 }),
  make("king-oyster-eryngii", "King Oyster (Eryngii)", "edible", { price: 259 }),
  make("dried-apricots", "Dried Apricots", "dry-fruits", { inStock: false, stockQuantity: 0 }),
];

const pushState = jest.spyOn(window.history, "pushState").mockImplementation((_data, _unused, url) => { push(String(url), { scroll: false }); });
afterAll(() => pushState.mockRestore());

function openShop(search = "", products = catalogue) {
  query = search;
  push.mockClear();
  (useProducts as jest.Mock).mockReturnValue({ products, loading: false, error: null });
  const store = configureStore({ reducer: { cartReducer } });
  render(<Provider store={store}><Shop /></Provider>);
  return store;
}
const names = () => screen.queryAllByRole("heading", { level: 2 }).map(h => h.textContent);
const pressed = (name: RegExp) => screen.getByRole("button", { name }).getAttribute("aria-pressed");

describe("Himalayan pantry shop", () => {
  it("restores several categories from a shared or refreshed URL", () => {
    openShop("category=spices,seeds");
    expect(names()).toEqual(expect.arrayContaining(["Cumin Seeds", "Black Pepper", "Chia Seeds"]));
    expect(names()).not.toContain("Premium Walnuts");
    expect(pressed(/^Spices/)).toBe("true");
    expect(pressed(/^Seeds/)).toBe("true");
    expect(pressed(/^All/)).toBe("false");
    expect(screen.getByRole("status").textContent).toBe("3 products in Spices, Seeds");
  });

  it("writes category and sort changes to the URL so refresh and Back keep them", () => {
    openShop("category=spices&sort=price-high");
    fireEvent.click(screen.getByRole("button", { name: /^Dry fruits/ }));
    expect(push).toHaveBeenLastCalledWith("/shop?category=spices,dry-fruits&sort=price-high", { scroll: false });
    fireEvent.change(screen.getByRole("combobox", { name: "Sort by" }), { target: { value: "name" } });
    expect(push).toHaveBeenLastCalledWith("/shop?category=spices&sort=name", { scroll: false });
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(push).toHaveBeenLastCalledWith("/shop", { scroll: false });
  });

  it("sorts by the price the shopper pays and keeps sold-out items last", () => {
    openShop("category=dry-fruits,spices&sort=price-high");
    expect(names()).toEqual(["Premium Walnuts", "Black Pepper", "Cumin Seeds", "Dried Apricots"]);
  });

  it("adds a pack in place and changes Add into a capped quantity control", () => {
    const store = openShop("category=spices");
    const card = screen.getByRole("heading", { name: "Cumin Seeds" }).closest("article")!;
    expect(within(card).getByRole("link").getAttribute("href")).toBe("/shop-details/cumin-seeds");
    fireEvent.click(within(card).getByRole("button", { name: "Add Cumin Seeds to bag" }));
    fireEvent.click(within(card).getByRole("button", { name: "Add one Cumin Seeds" }));
    expect(push).not.toHaveBeenCalled();
    expect(store.getState().cartReducer.items).toEqual([expect.objectContaining({ id: 1, slug: "cumin-seeds", quantity: 2, stockQuantity: 50 })]);
    expect(within(card).getByLabelText("2 in bag")).toBeTruthy();
  });

  it("marks fresh products, not the category chip, with the Dehradun-only rule", () => {
    openShop();
    const card = (name: string) => screen.getByRole("heading", { name }).closest("article")!;
    expect(within(card("King Oyster (Eryngii)")).getByText(/Fresh · Dehradun only/)).toBeTruthy();
    expect(within(card("Premium Walnuts")).queryByText("Ships across India")).toBeNull();
    const fresh = screen.getByRole("button", { name: "Fresh mushrooms, 1 product" });
    expect(fresh.textContent).toMatch(/^Fresh/);
    fireEvent.click(fresh);
    expect(push).toHaveBeenLastCalledWith("/shop?category=edible", { scroll: false });
  });

  it("groups pantry and mushroom chips, and toggles mushroom types alongside pantry selections", () => {
    const dried = make("dried-reishi", "Dried Reishi", "edible", {
      categories: [{ category: { id: 2, slug: "medicinal", title: "Medicinal" } }],
    });
    openShop("category=spices,edible", [...catalogue, dried]);
    expect(screen.getByText("Pantry")).toBeTruthy();
    expect(screen.getByText("Mushrooms")).toBeTruthy();
    expect(pressed(/^Fresh mushrooms/)).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: /^Medicinal mushrooms/ }));
    expect(push).toHaveBeenLastCalledWith("/shop?category=spices,edible,medicinal", { scroll: false });
    fireEvent.click(screen.getByRole("button", { name: /^Fresh mushrooms/ }));
    expect(push).toHaveBeenLastCalledWith("/shop?category=spices", { scroll: false });
  });

  it("shows the discounted price and offers a stock alert for sold-out items", () => {
    openShop("category=dry-fruits");
    const walnuts = screen.getByRole("heading", { name: "Premium Walnuts" }).closest("article")!;
    expect(walnuts.textContent).toMatch(/₹399.*Was ₹449/);
    fireEvent.click(screen.getByRole("button", { name: "Dried Apricots is sold out. Notify me when it is back" }));
    expect(screen.getByRole("dialog").textContent).toBe("Notify me about Dried Apricots");
  });

  it("ignores unknown categories in the URL", () => {
    openShop("category=not-a-category");
    expect(names()).toHaveLength(catalogue.length);
    expect(pressed(/^All/)).toBe("true");
  });

  it("keeps filters on page links and clamps an out-of-range page", () => {
    const many = Array.from({ length: 14 }, (_, i) => make(`spice-${i}`, `Spice ${String(i).padStart(2, "0")}`, "spices"));
    openShop("category=spices&sort=name&page=9", many);
    expect(screen.getByRole("link", { name: "Page 2" }).getAttribute("aria-current")).toBe("page");
    expect(names()).toEqual(["Spice 12", "Spice 13"]);
    expect(screen.getByRole("link", { name: "Page 1" }).getAttribute("href")).toBe("/shop?category=spices&sort=name");
    expect(screen.getByRole("link", { name: "Previous" }).getAttribute("href")).toBe("/shop?category=spices&sort=name");
  });

  it("explains a failed load and offers a retry", () => {
    (useProducts as jest.Mock).mockReturnValue({ products: [], loading: false, error: "Network" });
    render(<Provider store={configureStore({ reducer: { cartReducer } })}><Shop /></Provider>);
    expect(screen.getByRole("alert").textContent).toMatch(/couldn’t load/);
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });

  it("keeps spawn and grow bags out of the pantry and links to their homepage band", () => {
    const spawn = make("oyster-seed-or-spawn", "Oyster Seed ('or Spawn')", "seeds", { price: 156 });
    const bag = { ...make("oyster-grow-bag", "Ready-to-Fruit Oyster Mushroom Grow Bag", "seeds", { price: 129 }),
      categories: [{ category: { id: 9, slug: "grow-your-own", title: "Grow Your Own" } }] };
    openShop("", [...catalogue, spawn, bag]);
    expect(names()).not.toContain("Oyster Seed ('or Spawn')");
    expect(screen.getByRole("status").textContent).toBe(`${catalogue.length} products`);
    expect(screen.getByRole("button", { name: /^Seeds, 1 product$/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Grow/ })).toBeNull();
    expect(screen.getByRole("link", { name: /Spawn and grow bags/ })).toHaveAttribute("href", "/#grow");
  });

  it("has no grow link when the catalogue has no grow products", () => {
    openShop();
    expect(screen.queryByRole("link", { name: /Spawn and grow bags/ })).toBeNull();
  });
});
