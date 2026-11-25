import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import cartReducer from "@/redux/features/cart-slice";
import { useProducts } from "@/hooks/useProducts";
import { loadListings } from "../Training/programme";
import SearchResults from "./SearchResults";

let query = "";
jest.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(query) }));
jest.mock("@/hooks/useProducts", () => ({ useProducts: jest.fn() }));
jest.mock("next/image", () => ({ __esModule: true, default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} /> }));
jest.mock("../NotifyMeModal", () => ({ __esModule: true, default: () => null }));
jest.mock("../Training/programme", () => ({ ...jest.requireActual("../Training/programme"), loadListings: jest.fn() }));

const make = (id: number, slug: string, title: string, category: string, description = "") => ({
  id, slug, title, description, price: 149, discountedPrice: null, measurementValue: 200, measurementType: "gm", stockQuantity: 2,
  inStock: true, imgs: { previews: [], thumbnails: [] }, categories: [{ category: { id: 1, slug: category, title: category } }],
});
const products = [
  make(1, "himalayan-turmeric", "Himalayan Turmeric", "spices", "Pairs well with cumin."),
  make(2, "cumin-seeds", "Cumin Seeds", "spices"),
  make(3, "king-oyster-eryngii", "King Oyster (Eryngii)", "edible"),
];

const programme = (id: number, name: string, type: string, price: number) => ({
  id, name, type, price, slug: name.toLowerCase().replace(/ /g, "-"), description: "", duration: 5, dailyHours: "6 hours",
  isActive: true, hasEarlyBirdOffer: false,
});
const listings = [
  { program: programme(1, "Oyster Mushroom Training", "OYSTER", 5000), batch: { state: "upcoming" as const, start: "2026-12-14", end: "2026-12-18" }, hours: null },
  { program: programme(2, "Shiitake Mushroom Training", "SHIITAKE", 7500), batch: { state: "past" as const, start: "2026-10-05", end: "2026-10-09" }, hours: null },
];
const load = loadListings as jest.Mock;
beforeEach(() => { load.mockReset(); load.mockResolvedValue(listings); });

function search(value: string, state: Partial<{ loading: boolean; error: string | null }> = {}) {
  query = value;
  (useProducts as jest.Mock).mockReturnValue({ products, loading: false, error: null, ...state });
  const store = configureStore({ reducer: { cartReducer } });
  render(<Provider store={store}><SearchResults /></Provider>);
  return store;
}
const field = () => screen.getByRole("searchbox", { name: "Product or ingredient" }) as HTMLInputElement;

describe("Himalayan pantry search", () => {
  it("keeps the query, ranks name matches first and shows pack, price and delivery", () => {
    search("search=cumin");
    expect(field().value).toBe("cumin");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Results for “cumin”");
    expect(screen.getAllByRole("heading", { level: 2 }).map(h => h.textContent)).toEqual(["Cumin Seeds", "Himalayan Turmeric"]);
    const card = screen.getByRole("heading", { name: "Cumin Seeds" }).closest("article")!;
    expect(card.textContent).toMatch(/200 g/);
    expect(card.textContent).toMatch(/₹149/);
    expect(within(card).getByText("Ships across India")).toBeTruthy();
  });

  it("adds two packs from the results without leaving the page, capped by stock", () => {
    const store = search("search=cumin");
    const card = screen.getByRole("heading", { name: "Cumin Seeds" }).closest("article")!;
    fireEvent.click(within(card).getByRole("button", { name: "Add Cumin Seeds to bag" }));
    fireEvent.click(within(card).getByRole("button", { name: "Add one Cumin Seeds" }));
    expect(store.getState().cartReducer.items).toEqual([expect.objectContaining({ slug: "cumin-seeds", quantity: 2 })]);
    expect((within(card).getByRole("button", { name: "Add one Cumin Seeds" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("offers a way forward when nothing matches, keeping the query in the field", () => {
    search("search=saffron");
    expect(field().value).toBe("saffron");
    expect(screen.getByRole("heading", { name: "Nothing in the pantry matches “saffron”." })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Cumin" }).getAttribute("href")).toBe("/search?search=cumin");
    expect(screen.getByRole("link", { name: "Spices" }).getAttribute("href")).toBe("/shop?category=spices");
    expect(screen.getByRole("link", { name: "The whole pantry" }).getAttribute("href")).toBe("/shop");
    expect(screen.getByRole("link", { name: "Training" }).getAttribute("href")).toBe("/training");
  });

  it("invites a search when the query is empty and accepts the legacy q parameter", () => {
    search("");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("What are you looking for?");
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    search("q=king");
    expect(screen.getAllByRole("heading", { name: "King Oyster (Eryngii)" })).toHaveLength(1);
  });

  it("explains a failed load", () => {
    search("search=cumin", { error: "Network" });
    expect(screen.getByRole("alert").textContent).toMatch(/Search couldn’t load/);
  });

  it("does not load the courses for a product search", () => {
    search("search=cumin");
    expect(load).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading", { name: "Training" })).toBeNull();
  });
});

describe("Training courses in search", () => {
  it("shows the courses as the result of a pure training query, not the empty state", async () => {
    search("search=training");
    const group = (await screen.findByRole("heading", { name: "Training" })).closest("section")!;
    expect(within(group).getAllByRole("heading", { level: 3 }).map(h => h.textContent)).toEqual(["Oyster Mushroom Training", "Shiitake Mushroom Training"]);
    const oyster = within(group).getByRole("heading", { name: "Oyster Mushroom Training" }).closest("li")!;
    expect(oyster.textContent).toMatch(/5 days · Herbertpur/);
    expect(oyster.textContent).toMatch(/14–18 December 2026/);
    expect(oyster.textContent).toMatch(/₹5,000/);
    expect(within(oyster).getByRole("link", { name: "See dates and register for Oyster Mushroom Training" }).getAttribute("href"))
      .toBe("/training/oyster-mushroom-training/schedule");
    const shiitake = within(group).getByRole("heading", { name: "Shiitake Mushroom Training" }).closest("li")!;
    expect(shiitake.textContent).toMatch(/This batch has ended/);
    expect(within(group).getByRole("link", { name: "All training courses" }).getAttribute("href")).toBe("/training");
    expect(screen.queryByRole("heading", { name: /Nothing in the pantry matches/ })).toBeNull();
    expect(screen.getByRole("status").textContent).toMatch(/No pantry products match “training”/);
  });

  it("narrows to the course the query names", async () => {
    search("search=oyster%20course");
    await screen.findByRole("heading", { name: "Training" });
    expect(screen.getAllByRole("heading", { level: 3 }).map(h => h.textContent)).toEqual(["Oyster Mushroom Training"]);
  });

  it("shows products only when the courses fail to load", async () => {
    load.mockRejectedValue(new Error("Network"));
    search("search=training");
    expect(await screen.findByRole("heading", { name: "Nothing in the pantry matches “training”." })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Training" })).toBeNull();
  });
});
