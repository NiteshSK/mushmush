import { configureStore } from "@reduxjs/toolkit";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { useSession } from "next-auth/react";
import { renderToString } from "react-dom/server";
import cartReducer from "@/redux/features/cart-slice";
import ShopDetails from "./index";

const replace = jest.fn();
const openPanel = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn(), replace }) }));
// The shared jest setup drops every Link prop except href; keep aria attributes and class names for these tests.
jest.mock("next/link", () => ({ __esModule: true, default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => <a href={href} {...rest}>{children}</a> }));
jest.mock("next/image", () => ({ __esModule: true, default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} /> }));
jest.mock("../NotifyMeModal", () => ({ __esModule: true, default: ({ productTitle }: { productTitle: string }) => <div role="dialog">Notify me about {productTitle}</div> }));
jest.mock("../Pantry/PantryShell", () => ({ useOpenPanel: () => openPanel }));
jest.mock("@/hooks/useRecentlyViewed", () => ({ useRecentlyViewed: () => ({ addToRecentlyViewed: jest.fn() }) }));
const wishlist = { addToWishlist: jest.fn(async () => true), removeFromWishlist: jest.fn(async () => true), isInWishlist: jest.fn(() => false) };
jest.mock("@/app/context/WishlistContext", () => ({ useWishlist: () => wishlist, useOptionalWishlist: () => wishlist }));

const cumin = {
  id: 50, slug: "cumin-seeds", title: "Cumin Seeds", description: "<strong>Cumin Seeds</strong> (Jeera) are an essential spice.",
  price: 149, discountedPrice: null, hasDiscount: false, discountPercentage: 0, measurementValue: 200, measurementType: "gm",
  stockQuantity: 50, inStock: true, featured: false, reviewCount: 0, averageRating: 0,
  imgs: { previews: ["/images/products/cumin_seeds.png"], thumbnails: ["/images/products/cumin_seeds.png"] },
  specifications: ["<strong>Variety:</strong> Whole cumin seeds", "<strong>Shelf Life:</strong> 12-18 months in an airtight container"],
  howToConsume: ["<strong>Tadka:</strong> Heat oil and add the seeds.", "<strong>Jeera water:</strong> Boil a teaspoon in water."],
  additionalInfo: [{ label: "Origin", value: "Rajasthan / Gujarat, India" }, { label: "Storage", value: "Store in a cool, dry place" }],
  categories: [{ category: { id: 28, slug: "spices", title: "Spices" } }],
};
const kingOyster = {
  ...cumin, id: 14, slug: "king-oyster-eryngii", title: "King Oyster (Eryngii)", price: 259,
  imgs: { previews: ["/k1.png", "/k2.png", "/k3.png"], thumbnails: ["/k1.png", "/k2.png", "/k3.png"] },
  categories: [{ category: { id: 3, slug: "edible", title: "Edible Mushrooms" } }],
};
const pepper = { ...cumin, id: 48, slug: "black-pepper", title: "Black Pepper", price: 199 };
const chia = { ...cumin, id: 51, slug: "chia-seeds", title: "Chia Seeds", categories: [{ category: { id: 29, slug: "seeds", title: "Seeds" } }] };
const spawn = {
  ...cumin, id: 13, slug: "oyster-seed-or-spawn", title: "Oyster Seed ('or Spawn')", price: 156, measurementValue: 1000,
  description: "Oyster mushroom spawn is the foundation for a successful harvest.", howToConsume: [],
  categories: [{ category: { id: 30, slug: "grow-your-own", title: "Grow Your Own" } }],
};
const growBag = { ...spawn, id: 15, slug: "ready-to-fruit-oyster-mushroom-grow-bag", title: "Ready-to-Fruit Oyster Mushroom Grow Bag", price: 129 };

type Reply = { status?: number; body?: unknown };
let replies: Record<"product" | "reviews" | "related", Reply[]>;
const json = ({ status = 200, body = {} }: Reply) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

function serve(product: object | null, extra: Partial<typeof replies> = {}) {
  replies = { product: [{ body: { products: product ? [product] : [] } }], reviews: [{ body: { reviews: [], totalReviews: 0, averageRating: 0 } }], related: [{ body: { products: [pepper] } }], ...extra };
  const next = (key: keyof typeof replies) => replies[key].length > 1 ? replies[key].shift()! : replies[key][0];
  global.fetch = jest.fn((url: string) => json(next(url.startsWith("/api/reviews") ? "reviews" : url.includes("category=") ? "related" : "product"))) as jest.Mock;
}

async function open(slug?: string) {
  const store = configureStore({ reducer: { cartReducer } });
  await act(async () => { render(<Provider store={store}><ShopDetails slug={slug} /></Provider>); });
  return store;
}
const panel = () => screen.getByRole("heading", { level: 1 }).closest("section")!;

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  wishlist.isInWishlist.mockReturnValue(false);
  (useSession as jest.Mock).mockReturnValue({ data: null, status: "unauthenticated" });
});

describe("Product details", () => {
  it("puts pack, server price, stock and delivery beside Add, and reads the real slug", async () => {
    serve(cumin);
    await open("cumin-seeds");
    expect(global.fetch).toHaveBeenCalledWith("/api/products?slug=cumin-seeds", expect.anything());
    expect(screen.getByRole("heading", { level: 1, name: "Cumin Seeds" })).toBeTruthy();
    const text = panel().textContent;
    expect(text).toMatch(/Spices/);
    expect(text).toMatch(/200 g·₹149/);
    expect(text).toMatch(/In stock/);
    expect(text).toMatch(/Ships across India/);
    expect(within(panel()).getByRole("button", { name: "Add Cumin Seeds to bag" })).toBeTruthy();
    fireEvent.click(within(panel()).getByRole("button", { name: "Check delivery" }));
    expect(openPanel).toHaveBeenCalledWith("delivery");
  });

  it("keeps a short summary by Add and shows all the product information, headed, below the purchase area", async () => {
    serve(cumin);
    await open("cumin-seeds");
    expect(panel().textContent).toMatch(/Cumin Seeds \(Jeera\) are an essential spice\./);
    expect(within(panel()).getByRole("link", { name: "Product details" }).getAttribute("href")).toBe("#about");
    expect(screen.queryByRole("dialog")).toBeNull();
    const about = screen.getByRole("region", { name: "About Cumin Seeds" });
    expect(about.id).toBe("about");
    expect(panel().contains(about)).toBe(false);
    // The purchase panel comes first, then About, then reviews.
    const reviews = screen.getByRole("heading", { level: 2, name: "Reviews" });
    expect(within(panel()).getByRole("button", { name: "Add Cumin Seeds to bag" }).compareDocumentPosition(about) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(about.compareDocumentPosition(reviews) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(about).getAllByRole("heading", { level: 3 }).map(h => h.textContent)).toEqual(["How to use", "Specifications", "Storage"]);
    expect(within(screen.getByRole("region", { name: "How to use" })).getAllByRole("listitem").map(li => li.textContent))
      .toEqual(["Tadka: Heat oil and add the seeds.", "Jeera water: Boil a teaspoon in water."]);
    const specifications = screen.getByRole("region", { name: "Specifications" });
    expect(specifications.textContent).toMatch(/Variety: Whole cumin seeds.*Origin.*Rajasthan/);
    expect(specifications.textContent).not.toMatch(/Shelf Life|Storage/);
    expect(screen.getByRole("region", { name: "Storage" }).textContent).toMatch(/Storage: Store in a cool, dry place.*Shelf Life: 12-18 months/);
    expect(screen.queryByRole("heading", { name: "Benefits" })).toBeNull();
    expect(screen.getByRole("link", { name: "Spices" }).getAttribute("href")).toBe("/shop?category=spices");
    expect(screen.getByRole("heading", { name: "Black Pepper" })).toBeTruthy();
  });

  it("shows only the topics that have stored copy, and nothing when there is none", async () => {
    serve({ ...cumin, description: "", specifications: [], howToConsume: [], additionalInfo: [{ label: "Storage", value: "Keep refrigerated" }] });
    await open("cumin-seeds");
    const about = screen.getByRole("region", { name: "About Cumin Seeds" });
    expect(within(about).getAllByRole("heading", { level: 3 }).map(h => h.textContent)).toEqual(["Storage"]);
    expect(about.textContent).toMatch(/Keep refrigerated/);
    expect(within(panel()).getByRole("link", { name: "Product details" })).toBeTruthy();

    cleanup();
    serve({ ...cumin, description: " ", specifications: [], howToConsume: [], additionalInfo: [], benefits: "" });
    await open("cumin-seeds");
    expect(screen.queryByRole("heading", { name: /^About/ })).toBeNull();
    expect(within(panel()).queryByRole("link", { name: "Product details" })).toBeNull();
  });

  it("keeps stored rich copy readable and safe: no style or script, stored headings below the topics, lines as paragraphs", async () => {
    serve({
      ...cumin, title: "Grow Bag",
      description: "First line of the bag.\nSecond line of the bag.\n\n",
      specifications: ["<style>.spec-row { color: red }</style><div class=\"spec-row\"><div class=\"spec-key\">Product Weight</div><div class=\"spec-value\">Approx. 2.2 kg</div></div><script>window.bad = 1</script>"],
      howToConsume: ["<div><h2>How to consume?</h2><h3>Tea</h3><ul><li onclick=\"bad()\">Simmer for 30 minutes.</li></ul></div>"],
      benefits: JSON.stringify({ immuneSupport: "Contains PSK and PSP." }),
      additionalInfo: [{ label: "Botanical Name", value: "Pleurotus ostreatus" }],
    });
    await open("cumin-seeds");
    const about = screen.getByRole("region", { name: "About Grow Bag" });
    expect(about.innerHTML).not.toMatch(/<style|<script|onclick|color: red|window\.bad|How to consume/);
    expect(Array.from(about.querySelectorAll("p")).slice(0, 2).map(p => p.textContent)).toEqual(["First line of the bag.", "Second line of the bag."]);
    expect(within(about).getByRole("heading", { level: 4, name: "Tea" })).toBeTruthy();
    expect(within(about).queryByRole("heading", { level: 2, name: "How to consume?" })).toBeNull();
    expect(screen.getByRole("region", { name: "Specifications" }).textContent).toMatch(/Product Weight.*Approx\. 2\.2 kg.*Botanical Name.*Pleurotus ostreatus/);
    expect(screen.getByRole("region", { name: "Benefits" }).textContent).toBe("BenefitsImmune supportContains PSK and PSP.");
  });

  it("turns Add into a stepper capped by stock, with slug and stock on the bag line", async () => {
    serve({ ...cumin, stockQuantity: 2 });
    const store = await open("cumin-seeds");
    expect(panel().textContent).toMatch(/Only 2 left/);
    fireEvent.click(within(panel()).getByRole("button", { name: "Add Cumin Seeds to bag" }));
    const more = within(panel()).getByRole("button", { name: "Add one Cumin Seeds" });
    fireEvent.click(more);
    expect(more.hasAttribute("disabled")).toBe(true);
    expect(within(panel()).getByLabelText("2 in bag")).toBeTruthy();
    expect(store.getState().cartReducer.items).toEqual([expect.objectContaining({ id: 50, slug: "cumin-seeds", quantity: 2, stockQuantity: 2, price: 149 })]);
    expect(panel().textContent).toMatch(/that is all 2 we have/);
    expect(within(panel()).getByRole("link", { name: "Go to checkout" }).getAttribute("href")).toBe("/checkout");
    fireEvent.click(within(panel()).getByRole("button", { name: "Remove one Cumin Seeds" }));
    expect(store.getState().cartReducer.items[0].quantity).toBe(1);
  });

  it("shows the discounted price from the server with the struck list price", async () => {
    serve({ ...cumin, price: 449, discountedPrice: 399, hasDiscount: true, discountPercentage: 11 });
    await open("cumin-seeds");
    expect(panel().textContent).toMatch(/₹399Was ₹449.*11% off/);
  });

  it("marks fresh mushrooms as Dehradun only and lets shoppers swipe or pick photos", async () => {
    serve(kingOyster, { related: [{ body: { products: [] } }] });
    await open("king-oyster-eryngii");
    expect(panel().textContent).toMatch(/Fresh mushrooms/);
    expect(panel().textContent).toMatch(/Fresh · Dehradun only/);
    expect(within(panel()).getByRole("link", { name: "Dried mushrooms" }).getAttribute("href")).toBe("/search?search=dried%20mushrooms");
    const second = screen.getByRole("button", { name: "Show photo 2 of 3" });
    expect(second.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(second);
    expect(second.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("region", { name: /Photos of King Oyster/ })).toBeTruthy();
  });

  it("tells shoppers spawn is for growing, not eating, beside Add, with training and bulk links", async () => {
    serve(spawn, { related: [{ body: { products: [growBag, chia] } }] });
    await open("oyster-seed-or-spawn");
    const note = within(panel()).getByRole("note", { name: "For growing mushrooms. Not for eating." });
    expect(note.textContent).toMatch(/cook only the mushrooms you harvest/);
    expect(within(note).getByRole("link", { name: "Learn to grow with our training" }).getAttribute("href")).toBe("/training");
    expect(within(note).getByRole("link", { name: "Buying for a farm? Ask about bulk spawn" }).getAttribute("href")).toBe("/contact?subject=Bulk%20spawn");
    // The note comes before Add, so it is read before the pack goes in the bag.
    const add = within(panel()).getByRole("button", { name: "Add Oyster Seed ('or Spawn') to bag" });
    expect(note.compareDocumentPosition(add) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(note.textContent).not.toMatch(/India|Dehradun|shelf life|bulk price|₹/i);
    expect(panel().querySelector("p")!.textContent).toBe("Grow your own");
    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(crumbs).getByRole("link", { name: "Grow your own" }).getAttribute("href")).toBe("/#grow");
    // Related suggests other growing supplies only, never food.
    expect(global.fetch).toHaveBeenCalledWith("/api/products?category=grow-your-own&limit=12", expect.anything());
    const related = screen.getByRole("heading", { level: 2, name: "More for growing mushrooms" }).closest("section")!;
    expect(within(related).getByRole("heading", { name: growBag.title })).toBeTruthy();
    expect(within(related).queryByRole("heading", { name: "Chia Seeds" })).toBeNull();
    expect(within(related).getByRole("link", { name: "See all grow-your-own supplies" }).getAttribute("href")).toBe("/#grow");
  });

  it("treats spawn still filed under Seeds as a grow product, and keeps it off food pages", async () => {
    const filedUnderSeeds = { ...spawn, categories: chia.categories };
    serve(filedUnderSeeds, { related: [{ body: { products: [chia, growBag] } }] });
    await open("oyster-seed-or-spawn");
    expect(within(panel()).getByRole("note", { name: "For growing mushrooms. Not for eating." })).toBeTruthy();
    expect(within(screen.getByRole("navigation", { name: "Breadcrumb" })).getByRole("link", { name: "Grow your own" }).getAttribute("href")).toBe("/#grow");
    let related = screen.getByRole("heading", { level: 2, name: "More for growing mushrooms" }).closest("section")!;
    expect(within(related).queryByRole("heading", { name: "Chia Seeds" })).toBeNull();
    expect(within(related).getByRole("heading", { name: growBag.title })).toBeTruthy();

    cleanup();
    serve(chia, { related: [{ body: { products: [filedUnderSeeds, growBag, cumin] } }] });
    await open("chia-seeds");
    expect(within(panel()).queryByRole("note")).toBeNull();
    related = screen.getByRole("heading", { level: 2, name: "More seeds" }).closest("section")!;
    expect(within(related).queryByRole("heading", { name: /Spawn|Grow Bag/ })).toBeNull();
    expect(within(related).getByRole("heading", { name: "Cumin Seeds" })).toBeTruthy();
  });

  it("offers Notify me when the product is sold out", async () => {
    serve({ ...cumin, inStock: false, stockQuantity: 0 });
    await open("cumin-seeds");
    expect(panel().textContent).toMatch(/Sold out/);
    expect(within(panel()).queryByRole("button", { name: /to bag/ })).toBeNull();
    fireEvent.click(within(panel()).getByRole("button", { name: "Cumin Seeds is sold out. Notify me when it is back" }));
    expect(screen.getByRole("dialog").textContent).toBe("Notify me about Cumin Seeds");
  });

  it("offers Notify me and removal when an older bag holds a pack that is now sold out", async () => {
    serve({ ...cumin, inStock: false, stockQuantity: 0 });
    const store = configureStore({ reducer: { cartReducer }, preloadedState: { cartReducer: { items: [{ id: 50, slug: "cumin-seeds", title: "Cumin Seeds", price: 149, quantity: 1, stockQuantity: 5 }] } } });
    await act(async () => { render(<Provider store={store}><ShopDetails slug="cumin-seeds" /></Provider>); });
    expect(within(panel()).getByRole("button", { name: /sold out\. Notify me/ })).toBeTruthy();
    expect(within(panel()).queryByRole("link", { name: "Go to checkout" })).toBeNull();
    expect(panel().textContent).toMatch(/Your bag has 1, but this pack is sold out\./);
    fireEvent.click(within(panel()).getByRole("button", { name: "Remove from bag" }));
    expect(store.getState().cartReducer.items).toEqual([]);
  });

  it("turns an unknown slug into a search and shop recovery", async () => {
    serve(null);
    await open("cumin-seed");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("We couldn’t find that product.");
    expect(screen.getByRole("link", { name: "Search for “cumin seed”" }).getAttribute("href")).toBe("/search?search=cumin%20seed");
    expect(screen.getByRole("link", { name: "Shop the whole pantry" }).getAttribute("href")).toBe("/shop");
  });

  it("explains a failed load and retries", async () => {
    serve(null, { product: [{ status: 500 }, { body: { products: [cumin] } }] });
    await open("cumin-seeds");
    expect(screen.getByRole("alert").textContent).toMatch(/couldn’t load/);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Try again" })); });
    expect(screen.getByRole("heading", { level: 1, name: "Cumin Seeds" })).toBeTruthy();
  });

  it("forwards the bare entry to a stored product, or offers a way to find one", async () => {
    serve(cumin);
    await open(undefined);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Choose a product to see its details.");
    expect(global.fetch).not.toHaveBeenCalled();
    window.localStorage.setItem("productDetails", JSON.stringify({ id: 50, slug: "cumin-seeds" }));
    await open(undefined);
    expect(replace).toHaveBeenCalledWith("/shop-details/cumin-seeds");
  });

  it("keeps reviews and asks signed-out shoppers to sign in to review or save", async () => {
    serve({ ...cumin, reviewCount: 1, averageRating: 4 }, { reviews: [{ body: { reviews: [{ id: 1, rating: 4, comment: "Very fresh.", createdAt: "2026-10-01T00:00:00Z", user: { name: "Asha" } }], totalReviews: 1, averageRating: 4 } }] });
    await open("cumin-seeds");
    const reviews = screen.getByRole("heading", { level: 2, name: "Reviews" }).closest("section")!;
    expect(reviews.textContent).toMatch(/4\.0 out of 5 · 1 review/);
    expect(reviews.textContent).toMatch(/Asha.*Very fresh\./);
    expect(within(reviews).getByRole("link", { name: "Sign in" }).getAttribute("href")).toBe("/auth/signin?callbackUrl=%2Fshop-details%2Fcumin-seeds");
    expect(within(reviews).queryByRole("textbox")).toBeNull();
    expect(within(panel()).getByRole("link", { name: /1 review/ }).getAttribute("href")).toBe("#reviews");
    // Like the card heart, a signed-out shopper goes to sign-in and returns to this page.
    const realLocation = window.location;
    const assign = jest.fn();
    Object.defineProperty(window, "location", { configurable: true, value: { pathname: "/shop-details/cumin-seeds", search: "?from=search", assign } });
    try {
      fireEvent.click(within(panel()).getByRole("button", { name: "Save Cumin Seeds to wishlist" }));
    } finally {
      Object.defineProperty(window, "location", { configurable: true, value: realLocation });
    }
    expect(assign).toHaveBeenCalledWith("/auth/signin?callbackUrl=%2Fshop-details%2Fcumin-seeds%3Ffrom%3Dsearch");
    expect(wishlist.addToWishlist).not.toHaveBeenCalled();
    expect(within(panel()).queryByRole("link", { name: "Sign in" })).toBeNull();
  });

  it("saves to the wishlist when signed in and shows the review form", async () => {
    (useSession as jest.Mock).mockReturnValue({ data: { user: { email: "a@example.com" } }, status: "authenticated" });
    serve(cumin);
    await open("cumin-seeds");
    await act(async () => { fireEvent.click(within(panel()).getByRole("button", { name: "Save Cumin Seeds to wishlist" })); });
    expect(wishlist.addToWishlist).toHaveBeenCalledWith(50);
    expect(within(panel()).getByRole("status").textContent).toBe("Saved to your wishlist.");
    expect(screen.getByRole("textbox", { name: "Your review" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "5 stars" })).toBeTruthy();
  });

  it("removes a saved product without a confirmation pop-up, like the card hearts", async () => {
    (useSession as jest.Mock).mockReturnValue({ data: { user: { email: "a@example.com" } }, status: "authenticated" });
    wishlist.isInWishlist.mockReturnValue(true);
    serve(cumin);
    await open("cumin-seeds");
    const save = within(panel()).getByRole("button", { name: "Save Cumin Seeds to wishlist" });
    expect(save.getAttribute("aria-pressed")).toBe("true");
    await act(async () => { fireEvent.click(save); });
    expect(wishlist.removeFromWishlist).toHaveBeenCalledWith(50, { confirm: false });
    expect(within(panel()).getByRole("status").textContent).toBe("Removed from your wishlist.");
  });
});

describe("Product details from the server", () => {
  const renderWith = (product: object, slug = "cumin-seeds") => {
    const store = configureStore({ reducer: { cartReducer } });
    return <Provider store={store}><ShopDetails slug={slug} initialProduct={product as never} /></Provider>;
  };
  // JSDOM has a window, so react-redux picks useLayoutEffect, which renderToString warns about. Next.js renders without a window.
  const quietServer = (element: React.ReactElement) => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    try { return renderToString(element); } finally { spy.mockRestore(); }
  };

  it("puts the title, pack, price, stock, summary and photo with its name in the first HTML", () => {
    const html = quietServer(renderWith(cumin));
    expect(html).toMatch(/<h1[^>]*>Cumin Seeds<\/h1>/);
    expect(html).toMatch(/200 g/);
    expect(html).toMatch(/₹149/);
    expect(html).toMatch(/In stock/);
    expect(html).toMatch(/Cumin Seeds \(Jeera\) are an essential spice\./);
    expect(html).toMatch(/<img[^>]*alt="Cumin Seeds"/);
    // The full product information is visible text in the first HTML, not hidden in a dialog.
    expect(html).toMatch(/<h2 id="about-title">About Cumin Seeds<\/h2>/);
    expect(html).toMatch(/<h3[^>]*>How to use<\/h3>.*Heat oil and add the seeds/);
    expect(html).toMatch(/Rajasthan \/ Gujarat, India/);
    expect(html).not.toMatch(/<dialog|hidden=""/);
    expect(html).not.toMatch(/Opening the product/);
    expect(html).not.toMatch(/aria-busy="true"/);
  });

  it("says Sold out in the first HTML when no pack is left", () => {
    const html = quietServer(renderWith({ ...cumin, inStock: true, stockQuantity: 0 }));
    expect(html).toMatch(/Sold out/);
    expect(html).not.toMatch(/Add to bag/);
  });

  it("shows the server product at once, then refreshes the price quietly from the API", async () => {
    let answer: (value: unknown) => void = () => undefined;
    serve(cumin);
    global.fetch = jest.fn((url: string) => url.startsWith("/api/products?slug=")
      ? new Promise(resolve => { answer = resolve; })
      : json({ body: url.startsWith("/api/reviews") ? { reviews: [], totalReviews: 0, averageRating: 0 } : { products: [pepper] } })) as jest.Mock;
    render(renderWith(cumin));
    expect(screen.getByRole("heading", { level: 1, name: "Cumin Seeds" })).toBeTruthy();
    expect(screen.queryByText("Opening the product…")).toBeNull();
    expect(panel().textContent).toMatch(/₹149/);
    expect(global.fetch).toHaveBeenCalledWith("/api/products?slug=cumin-seeds", expect.anything());
    await act(async () => { answer(await json({ body: { products: [{ ...cumin, discountedPrice: 129, hasDiscount: true, discountPercentage: 13 }] } })); });
    expect(panel().textContent).toMatch(/₹129Was ₹149.*13% off/);
  });

  it("keeps the server product when the refresh fails or finds nothing", async () => {
    serve(null, { product: [{ status: 500 }] });
    await act(async () => { render(renderWith(cumin)); });
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "Cumin Seeds" })).toBeTruthy();

    cleanup();
    serve(null);
    await act(async () => { render(renderWith(cumin)); });
    expect(screen.getByRole("heading", { level: 1, name: "Cumin Seeds" })).toBeTruthy();
  });
});
