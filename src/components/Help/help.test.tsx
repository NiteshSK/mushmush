import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import type { ReactNode } from "react";
import cartReducer from "@/redux/features/cart-slice";
import { CONVENIENCE_FEE } from "@/lib/fees";
import { BASE_SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { prisma } from "@/lib/prisma";
import PantryShell from "../Pantry/PantryShell";
import { hidesChat, isPantryRoute } from "../Pantry/routes";
import AboutUs from "../AboutUs";
import ErrorRecovery from "../Error";
import MailSuccess from "../MailSuccess";
import FaqsPage from "./FaqsPage";
import { getShippingSummary } from "./shipping";
import { rupees, type ShippingSummary } from "./money";

jest.mock("@/lib/prisma", () => ({ prisma: { shippingZone: { aggregate: jest.fn() } } }));
jest.mock("next/link", () => ({ __esModule: true, default: ({ children, href, ...rest }: { children: ReactNode; href: string }) => <a href={href} {...rest}>{children}</a> }));
jest.mock("next/image", () => ({ __esModule: true, default: ({ alt }: { alt: string }) => <img alt={alt} /> }));

beforeAll(() => {
  // jsdom has no modal dialog support.
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) { this.removeAttribute("open"); };
});

const shipping: ShippingSummary = { baseFee: BASE_SHIPPING_FEE, freeFrom: FREE_SHIPPING_THRESHOLD, convenienceFee: CONVENIENCE_FEE, range: { min: 50, max: 150 } };
const inShell = (page: ReactNode) => render(<Provider store={configureStore({ reducer: { cartReducer } })}><PantryShell browseHref="/shop">{page}</PantryShell></Provider>);
const text = () => document.body.textContent ?? "";

describe("help routes use the pantry shell", () => {
  it.each(["/about-us", "/faqs", "/contact", "/mail-success", "/error"])("%s skips the legacy layout and keeps the chat launcher", route => {
    expect(isPantryRoute(route)).toBe(true);
    expect(hidesChat(route)).toBe(false);
  });
});

describe("/faqs", () => {
  // Focus return to the trigger is checked in a real browser: jsdom focuses autoFocus fields inside a closed dialog.
  it("puts delivery first, open, with a PIN check beside the answer", () => {
    inShell(<FaqsPage shipping={shipping} />);
    const topics = within(screen.getByRole("navigation", { name: "Question topics" })).getAllByRole("link");
    expect(topics.map(link => link.getAttribute("href"))).toEqual(["#delivery", "#orders", "#products", "#training"]);
    const first = document.querySelector("details")!;
    expect(first.open).toBe(true);
    expect(first.querySelector("summary")!.textContent).toBe("Where do you deliver?");
    expect(first.textContent).toContain("Fresh mushrooms are sold in Dehradun only.");

    const trigger = within(first).getByRole("button", { name: "Check delivery to your PIN" });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Delivery to your door" });
    expect(document.activeElement).toBe(within(dialog).getByLabelText("Delivery PIN code"));
    fireEvent.click(within(dialog).getByRole("button", { name: "Close dialog" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("quotes fees from the pricing code and the zones, and never says taxes are included", () => {
    inShell(<FaqsPage shipping={shipping} />);
    expect(text()).toContain(`Orders of ${rupees(FREE_SHIPPING_THRESHOLD)} or more ship free.`);
    expect(text()).toContain(`shipping costs ₹50 to ₹150, depending on your PIN code`);
    expect(text()).toContain(`adds a ${rupees(CONVENIENCE_FEE)} convenience fee`);
    expect(text()).not.toMatch(/tax/i);
    expect(text()).not.toMatch(/organic|certified/i);
  });

  it("falls back to the base fee when the zones can't be read", () => {
    inShell(<FaqsPage shipping={{ ...shipping, range: undefined }} />);
    expect(text()).toContain(`shipping starts at ${rupees(BASE_SHIPPING_FEE)} and depends on your PIN code`);
  });

  it("says spawn and grow bags are for growing, not eating, and links to the grow section", () => {
    inShell(<FaqsPage shipping={shipping} />);
    const answer = Array.from(document.querySelectorAll("details")).find(item => item.querySelector("summary")!.textContent === "What does Kosvana sell?")!;
    expect(answer.textContent).toMatch(/spawn and grow bags\. These are for growing mushrooms at home, not for eating\./);
    expect(within(answer).getByRole("link", { name: "learn to grow your own" }).getAttribute("href")).toBe("/training#grow");
  });

  it("keeps contact options beside the questions", () => {
    inShell(<FaqsPage shipping={shipping} />);
    const aside = screen.getByRole("complementary", { name: "Still need help?" });
    expect(within(aside).getByRole("link", { name: /WhatsApp/ })).toBeTruthy();
    expect(within(aside).getByRole("link", { name: "Send us a message" }).getAttribute("href")).toBe("/contact");
  });
});

describe("getShippingSummary", () => {
  const aggregate = prisma.shippingZone.aggregate as unknown as jest.Mock;

  it("adds the base fee to the cheapest and dearest active zone", async () => {
    aggregate.mockResolvedValueOnce({ _min: { baseFee: 0 }, _max: { baseFee: 100 } });
    await expect(getShippingSummary()).resolves.toEqual({ baseFee: BASE_SHIPPING_FEE, freeFrom: FREE_SHIPPING_THRESHOLD, convenienceFee: CONVENIENCE_FEE, range: { min: BASE_SHIPPING_FEE, max: BASE_SHIPPING_FEE + 100 } });
    expect(aggregate).toHaveBeenCalledWith(expect.objectContaining({ where: { isActive: true } }));
  });

  it("still renders the page when the database is down", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    aggregate.mockRejectedValueOnce(new Error("offline"));
    await expect(getShippingSummary()).resolves.not.toHaveProperty("range");
  });
});

describe("/about-us", () => {
  it("tells the Herbertpur story without unsupported numbers or certifications", () => {
    inShell(<AboutUs />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Grown in Herbertpur.");
    expect(text()).toContain("Bhartendu, Pravesh and Vikrant");
    expect(text()).toContain("Kosvana by Mush Agro Products LLP");
    expect(text()).not.toMatch(/organic|certif|zero chemicals|\d+\+|kg|award|since \d{4}/i);
    expect(within(screen.getByRole("main")).queryByRole("img")).toBeNull();
    expect(screen.getByRole("link", { name: "Shop the pantry" }).getAttribute("href")).toBe("/shop");
    expect(screen.getByRole("link", { name: "See training dates and fees" }).getAttribute("href")).toBe("/training");
  });

  it("links each shelf to a real shop filter", () => {
    inShell(<AboutUs />);
    const shelves = within(screen.getByRole("region", { name: "What we sell" })).getAllByRole("link").map(link => link.getAttribute("href"));
    expect(shelves).toEqual(["/shop?category=edible,medicinal", "/shop?category=spices", "/shop?category=dry-fruits", "/shop?category=seeds", "/#grow"]);
  });

  it("lists spawn and grow bags apart from seeds, as growing supplies", () => {
    inShell(<AboutUs />);
    const region = within(screen.getByRole("region", { name: "What we sell" }));
    expect(region.getByRole("link", { name: /^Seeds/ }).textContent).not.toMatch(/spawn/i);
    const grow = region.getByRole("link", { name: /Spawn and grow bags/ });
    expect(grow.getAttribute("href")).toBe("/#grow");
    expect(grow.textContent).toMatch(/not for eating/);
    expect(grow.textContent).not.toMatch(/India|Dehradun/);
  });
});

describe("/about-us next steps", () => {
  it("ends with four clear actions, and the delivery action opens the PIN check", () => {
    inShell(<AboutUs />);
    const next = screen.getByRole("region", { name: "What you can do next" });
    const links = within(next).getAllByRole("link").map(link => [link.textContent, link.getAttribute("href")]);
    expect(links).toEqual([["Shop the pantry", "/shop"], ["Learn to grow mushrooms", "/training"], ["Contact us", "/contact"]]);
    fireEvent.click(within(next).getByRole("button", { name: "Check delivery to your PIN" }));
    expect(screen.getByRole("dialog", { name: "Delivery to your door" })).toBeTruthy();
  });

  it("styles every action as a button or an underlined link", () => {
    inShell(<AboutUs />);
    const main = screen.getByRole("main");
    for (const control of within(main).getAllByRole("link").concat(within(main).getAllByRole("button"))) {
      expect(control.className || control.closest("ul")?.className).toMatch(/solid|outline|inlineLink|shelves/);
    }
  });
});

describe("/mail-success and /error", () => {
  it("names the sent message and points to the shop", () => {
    inShell(<MailSuccess />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Your message is on its way.");
    expect(screen.getByRole("link", { name: "Shop the pantry" }).getAttribute("href")).toBe("/shop");
    expect(screen.getByRole("link", { name: "Send another message" }).getAttribute("href")).toBe("/contact");
  });

  it("offers search, the shop and contact as recovery", () => {
    inShell(<ErrorRecovery />);
    const search = screen.getByRole("search");
    expect(search.getAttribute("action")).toBe("/search");
    expect((within(search).getByLabelText("Search the pantry") as HTMLInputElement).name).toBe("search");
    const main = screen.getByRole("main");
    expect(within(main).getByRole("link", { name: "Browse the shop" }).getAttribute("href")).toBe("/shop");
    expect(within(main).getByRole("link", { name: "Contact us" }).getAttribute("href")).toBe("/contact");
  });
});
