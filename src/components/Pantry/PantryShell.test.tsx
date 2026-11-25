import { render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useSession } from "next-auth/react";
import cartReducer from "@/redux/features/cart-slice";
import PantryShell, { signInHere } from "./PantryShell";
import PantryDialog from "./PantryDialog";

jest.mock("next/navigation", () => ({ usePathname: () => "/shop", useRouter: () => ({ push: jest.fn() }), useSearchParams: () => new URLSearchParams() }));

const shell = () => render(<Provider store={configureStore({ reducer: { cartReducer } })}><PantryShell><p>Page</p></PantryShell></Provider>);
const header = () => within(screen.getByRole("banner"));

describe("signInHere", () => {
  it("returns the shopper to the page they were on", () => {
    expect(signInHere("/shop")).toBe("/auth/signin?callbackUrl=%2Fshop");
    expect(signInHere("/shop-details/cumin-seeds")).toBe("/auth/signin?callbackUrl=%2Fshop-details%2Fcumin-seeds");
  });
  it("does not return to the homepage or an auth form", () => {
    for (const path of ["/", "/auth/signin", "/auth/signup", "/auth/forgot-password", null]) expect(signInHere(path)).toBe("/auth/signin");
  });
});

describe("header account link", () => {
  afterEach(() => (useSession as jest.Mock).mockReset?.());

  it("shows Sign in in the header when signed out", () => {
    shell();
    expect(header().getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/auth/signin?callbackUrl=%2Fshop");
  });

  it("shows Account in the header when signed in", () => {
    (useSession as jest.Mock).mockReturnValue({ status: "authenticated", data: { user: { id: "u1" } } });
    shell();
    expect(header().getByRole("link", { name: "Account" })).toHaveAttribute("href", "/account");
    expect(header().queryByRole("link", { name: "Sign in" })).toBeNull();
  });
});

describe("menu", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = HTMLDialogElement.prototype.showModal || function (this: HTMLDialogElement) { this.open = true; };
    HTMLDialogElement.prototype.close = HTMLDialogElement.prototype.close || function (this: HTMLDialogElement) { this.open = false; };
  });

  it("starts with Sign in and Create account for signed-out shoppers", () => {
    render(<PantryDialog panel="menu" onClose={() => {}} signInHref="/auth/signin?callbackUrl=%2Fshop" />);
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/auth/signin?callbackUrl=%2Fshop");
    expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute("href", "/auth/signup");
    expect(screen.queryByRole("link", { name: "My account" })).toBeNull();
  });

  it("shows My account for signed-in shoppers", () => {
    render(<PantryDialog panel="menu" onClose={() => {}} signedIn />);
    expect(screen.getByRole("link", { name: "My account" })).toHaveAttribute("href", "/account");
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
  });
});

describe("main navigation", () => {
  it("offers Training between Shop and Our story", () => {
    shell();
    const nav = within(screen.getByRole("navigation", { name: "Main navigation" }));
    expect(nav.getAllByRole("link").map(link => link.textContent)).toEqual(["Shop", "Training", "Our story"]);
    expect(nav.getByRole("link", { name: "Training" })).toHaveAttribute("href", "/training");
  });
});

