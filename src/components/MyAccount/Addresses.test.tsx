import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useSession } from "next-auth/react";
import Addresses from "./Addresses";

const replace = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ replace, push: jest.fn() }), usePathname: () => "/addresses" }));

const home = { id: "a1", street: "12 Rajpur Road", city: "Dehradun", state: "Uttarakhand", zip: "248001", country: "India", type: "BOTH", isDefault: true };
const office = { id: "a2", street: "Flat 4B, Lotus Apartments", city: "Bengaluru", state: "Karnataka", zip: "560038", country: "India", type: "SHIPPING", isDefault: false };

const ok = (body: unknown) => Promise.resolve({ ok: true, status: 200, json: async () => body });

async function openAddresses(addresses = [home, office]) {
  (useSession as jest.Mock).mockReturnValue({ data: { user: { id: "u1", email: "shopper@example.test" } }, status: "authenticated" });
  (global.fetch as jest.Mock).mockImplementation(() => ok({ addresses }));
  render(<Addresses />);
  await screen.findAllByRole("heading", { level: 2 });
}
const row = (street: string) => screen.getByText(street, { exact: false, selector: "address" }).closest("li")!;
const calls = () => (global.fetch as jest.Mock).mock.calls.map(([url, init]) => [url, init?.method ?? "GET", init?.body && JSON.parse(init.body)]);

describe("Addresses page", () => {
  it("sends a signed-out visitor to sign-in with a return URL", () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: "unauthenticated" });
    render(<Addresses />);
    expect(replace).toHaveBeenCalledWith("/auth/signin?callbackUrl=/addresses");
  });

  it("lists addresses compactly with their actions beside each one", async () => {
    await openAddresses();
    expect(screen.getByText("2 of 5 saved")).toBeInTheDocument();
    expect(within(row("12 Rajpur Road")).getByText("Default")).toBeInTheDocument();
    expect(within(row("12 Rajpur Road")).queryByRole("button", { name: /Make default/ })).toBeNull();
    expect(within(row("Flat 4B")).getByRole("button", { name: "Edit Flat 4B, Lotus Apartments" })).toBeInTheDocument();
    expect(within(row("Flat 4B")).getByRole("button", { name: "Make Flat 4B, Lotus Apartments your default address" })).toBeInTheDocument();
  });

  it("edits an address in a dialog, validates it, and returns focus to Edit on Escape", async () => {
    await openAddresses();
    const edit = within(row("Flat 4B")).getByRole("button", { name: /^Edit/ });
    edit.focus();
    fireEvent.click(edit);
    const dialog = screen.getByRole("dialog", { hidden: true });
    expect(within(dialog).getByRole("heading", { name: "Edit address", hidden: true })).toBeInTheDocument();
    const street = within(dialog).getByLabelText("House, building and street");
    expect(street).toHaveValue("Flat 4B, Lotus Apartments");
    fireEvent.change(street, { target: { value: "" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save address", hidden: true }));
    expect(street).toHaveAttribute("aria-invalid", "true");
    expect(within(dialog).getByText("Street address is required")).toBeInTheDocument();
    expect(calls().filter(([, method]) => method === "PUT")).toHaveLength(0);

    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
    expect(document.activeElement).toBe(edit);
  });

  it("saves an edited address and confirms it", async () => {
    await openAddresses();
    fireEvent.click(within(row("Flat 4B")).getByRole("button", { name: /^Edit/ }));
    const dialog = screen.getByRole("dialog", { hidden: true });
    fireEvent.change(within(dialog).getByLabelText("PIN code"), { target: { value: "56a0039" } });
    expect(within(dialog).getByLabelText("PIN code")).toHaveValue("560039");
    await act(async () => { fireEvent.click(within(dialog).getByRole("button", { name: "Save address", hidden: true })); });
    expect(calls()).toContainEqual(["/api/addresses/a2", "PUT", expect.objectContaining({ street: "Flat 4B, Lotus Apartments", zip: "560039", type: "SHIPPING", country: "India" })]);
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Address updated.");
  });

  it("asks before deleting and keeps the address on Keep", async () => {
    await openAddresses();
    fireEvent.click(within(row("Flat 4B")).getByRole("button", { name: /^Delete/ }));
    const confirm = screen.getByRole("group", { name: "Delete Flat 4B, Lotus Apartments?" });
    expect(document.activeElement).toBe(within(confirm).getByRole("button", { name: "Keep" }));
    fireEvent.click(within(confirm).getByRole("button", { name: "Keep" }));
    expect(calls().filter(([, method]) => method === "DELETE")).toHaveLength(0);

    fireEvent.click(within(row("Flat 4B")).getByRole("button", { name: /^Delete/ }));
    await act(async () => { fireEvent.click(within(screen.getByRole("group")).getByRole("button", { name: "Delete" })); });
    expect(calls()).toContainEqual(["/api/addresses/a2", "DELETE", undefined]);
  });

  it("starts an empty address book with Add, which makes the first address the default", async () => {
    await openAddresses([]);
    expect(screen.getByRole("heading", { name: "No saved addresses." })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add an address" }));
    expect(screen.getByRole("checkbox", { name: "Use as my default address", hidden: true })).toBeChecked();
  });

  it("stops adding at the five-address limit", async () => {
    await openAddresses(Array.from({ length: 5 }, (_, i) => ({ ...office, id: `x${i}`, street: `${i + 1} Mall Road` })));
    expect(screen.getByRole("button", { name: "Add an address" })).toBeDisabled();
    expect(screen.getByText(/You can save up to 5 addresses/)).toBeInTheDocument();
  });
});
