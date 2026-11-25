import { configureStore } from "@reduxjs/toolkit";
import { render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { useSession } from "next-auth/react";
import cartReducer from "@/redux/features/cart-slice";
import { CONVENIENCE_FEE } from "@/lib/fees";
import { BASE_SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { prisma } from "@/lib/prisma";
import { publicContactDetails } from "@/lib/public-contact";
import { DEFAULT_SETTINGS } from "@/lib/shop-settings";
import { getShippingSummary } from "../Help/shipping";
import { rupees } from "../Help/money";
import PantryShell from "../Pantry/PantryShell";
import { isPantryRoute } from "../Pantry/routes";
import Signup from "../Auth/Signup";
import TermsPage from "./TermsPage";
import PrivacyPage from "./PrivacyPage";
import { LEGAL_FACTS } from "./legal-facts";

jest.mock("@/lib/prisma", () => ({
  prisma: { globalConfig: { findMany: jest.fn() }, shippingZone: { aggregate: jest.fn() } },
}));
jest.mock("next/image", () => ({ __esModule: true, default: ({ alt }: { alt: string }) => <img alt={alt} /> }));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => "/auth/signup",
  useSearchParams: () => new URLSearchParams(""),
}));

const findSettings = prisma.globalConfig.findMany as jest.Mock;
const aggregateZones = prisma.shippingZone.aggregate as jest.Mock;
const setting = (key: string) => DEFAULT_SETTINGS.find(s => s.key === key)!.value;

beforeEach(() => {
  findSettings.mockReset().mockResolvedValue([]);
  aggregateZones.mockReset().mockResolvedValue({ _min: { baseFee: 0 }, _max: { baseFee: 100 } });
});

const renderTerms = async () => render(<TermsPage contact={await publicContactDetails()} shipping={await getShippingSummary()} />);
const renderPrivacy = async () => render(<PrivacyPage contact={await publicContactDetails()} />);
const html = () => document.body.innerHTML;

describe.each([
  ["/terms", renderTerms, ["Who sells to you", "Prices and fees", "Payment", "Delivery", "Cancellation", "Returns and refunds", "Complaints"]],
  ["/privacy", renderPrivacy, ["Who we are", "Data we collect", "Why we use it", "Your consent and choices", "Services that handle data for us", "Cookies and browser storage", "Your rights", "Grievance contact"]],
] as const)("%s", (route, renderPage, headings) => {
  it("uses the pantry shell", () => expect(isPantryRoute(route)).toBe(true));

  it("renders each section with a working contents link", async () => {
    await renderPage();
    const contents = screen.getByRole("navigation", { name: "Contents" });
    for (const heading of headings) {
      const section = screen.getByRole("region", { name: heading });
      expect(within(contents).getByRole("link", { name: heading })).toHaveAttribute("href", `#${section.id}`);
    }
    expect(within(contents).getAllByRole("link")).toHaveLength(screen.getAllByRole("region").length);
    expect(screen.getByText(/last updated/i)).toHaveTextContent("Last updated 25 November 2026");
  });

  it("shows the shop's contact details from the defaults", async () => {
    await renderPage();
    const text = document.body.textContent ?? "";
    expect(text).toContain(setting("company_name"));
    expect(text).toContain(setting("company_address"));
    expect(screen.getAllByRole("link", { name: setting("contact_email") })[0]).toHaveAttribute("href", `mailto:${setting("contact_email")}`);
    expect(screen.getAllByRole("link", { name: setting("contact_phone") })[0]).toHaveAttribute("href", "tel:+917618362662");
  });

  it("shows live values from global_configs", async () => {
    findSettings.mockResolvedValue([{ key: "contact_email", value: "orders@example.in" }, { key: "company_address", value: "Farm Road, Herbertpur" }]);
    await renderPage();
    expect(screen.getAllByRole("link", { name: "orders@example.in" }).length).toBeGreaterThan(0);
    expect(document.body.textContent).toContain("Farm Road, Herbertpur");
    expect(document.body.textContent).not.toContain(setting("contact_email"));
  });

  it("never shows owner placeholders or empty values", async () => {
    await renderPage();
    expect(html()).not.toMatch(/TODO_OWNER|TODO|undefined|null|NaN/);
    for (const fact of Object.values(LEGAL_FACTS)) expect(html()).not.toContain(fact.TODO_OWNER);
  });

  it("makes no tax-included, organic or certification claims", async () => {
    await renderPage();
    expect(document.body.textContent).not.toMatch(/taxes included|inclusive of tax|organic|certified|certification/i);
  });
});

describe("/terms selling rules", () => {
  it("quotes fees from the pricing code and the shipping zones", async () => {
    await renderTerms();
    const prices = screen.getByRole("region", { name: "Prices and fees" });
    expect(prices).toHaveTextContent(`Orders of ${rupees(FREE_SHIPPING_THRESHOLD)} or more ship free.`);
    expect(prices).toHaveTextContent(`shipping costs ${rupees(BASE_SHIPPING_FEE)} to ${rupees(BASE_SHIPPING_FEE + 100)}, depending on your PIN code`);
    expect(prices).toHaveTextContent(`Each order has a ${rupees(CONVENIENCE_FEE)} convenience fee.`);
  });

  it("falls back to the base fee when the zones cannot be read", async () => {
    aggregateZones.mockRejectedValue(new Error("down"));
    jest.spyOn(console, "error").mockImplementation(() => {});
    await renderTerms();
    expect(screen.getByRole("region", { name: "Prices and fees" })).toHaveTextContent(`shipping starts at ${rupees(BASE_SHIPPING_FEE)}`);
  });

  it("states the fresh delivery area, UPI payment and verification", async () => {
    await renderTerms();
    expect(screen.getByRole("region", { name: "Products and stock" })).toHaveTextContent("Fresh mushrooms are sold in Dehradun only");
    expect(screen.getByRole("region", { name: "Payment" })).toHaveTextContent("Your order is confirmed only after we verify the payment.");
    expect(screen.getByRole("region", { name: "Returns and refunds" })).toHaveTextContent(`contact us at ${setting("contact_email")}`);
  });
});

describe("site links", () => {
  it("adds Training, Terms and Privacy to the footer customer-service links", () => {
    render(<Provider store={configureStore({ reducer: { cartReducer } })}><PantryShell><main /></PantryShell></Provider>);
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByRole("link", { name: "Training" })).toHaveAttribute("href", "/training");
    expect(within(footer).getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
    expect(within(footer).getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
  });

  it("links the sign-up agreement to the terms and privacy pages", () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: "unauthenticated" });
    render(<Signup />);
    const agreement = screen.getByLabelText(/i agree/i).closest("label") as HTMLElement;
    expect(within(agreement).getByRole("link", { name: /terms/i })).toHaveAttribute("href", "/terms");
    expect(within(agreement).getByRole("link", { name: /privacy/i })).toHaveAttribute("href", "/privacy");
  });
});
