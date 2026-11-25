import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactPage from "@/components/Help/ContactPage";

jest.mock("next/link", () => ({ __esModule: true, default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => <a href={href} {...rest}>{children}</a> }));

const fetchMock = global.fetch as jest.Mock;
const field = (label: RegExp) => screen.getByLabelText(label) as HTMLInputElement;
const send = () => fireEvent.click(screen.getByRole("button", { name: "Send message" }));

async function fillValidForm(overrides: Partial<Record<"name" | "email" | "phone" | "subject" | "message", string>> = {}) {
  const values = { name: "Asha Negi", email: "asha@example.com", phone: "9876543210", subject: "Delivery", message: "Do you deliver to 110001?", ...overrides };
  for (const [label, value] of Object.entries(values)) {
    const input = field(new RegExp(`^${label}`, "i"));
    await userEvent.clear(input);
    if (value) await userEvent.type(input, value);
  }
}

describe("/contact", () => {
  beforeEach(() => fetchMock.mockReset());

  it("opens with direct channels, the delivery answer and a labelled form", () => {
    render(<ContactPage freeFrom={1999} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Talk to Kosvana.");
    expect(screen.getByRole("link", { name: /Message us on WhatsApp/ }).getAttribute("href")).toBe("https://wa.me/917618362662");
    expect(screen.getByRole("link", { name: "+91 76183 62662" }).getAttribute("href")).toBe("tel:+917618362662");
    expect(screen.getByRole("link", { name: "concierge@kosvana.com" }).getAttribute("href")).toBe("mailto:concierge@kosvana.com");
    const delivery = screen.getByRole("region", { name: "Delivery" });
    expect(delivery.textContent).toContain("Fresh mushrooms are sold in Dehradun only.");
    expect(delivery.textContent).toContain("Orders of ₹1,999 or more ship free.");
    expect(within(delivery).getByRole("button", { name: "Check delivery to your PIN" })).toBeTruthy();
    expect(screen.getByRole("form", { name: "Send a message" })).toBeTruthy();
    for (const label of [/^Name/, /^Email/, /^Subject/, /^Message/]) expect(field(label).required).toBe(true);
    expect(field(/^Phone/).required).toBe(false);
  });

  it("explains every missing field, focuses the first one and sends nothing", async () => {
    render(<ContactPage freeFrom={1999} />);
    send();
    await waitFor(() => expect(screen.getByText("Name is required")).toBeTruthy());
    for (const message of ["Email is required", "Subject is required", "Message is required"]) expect(screen.getByText(message)).toBeTruthy();
    expect(screen.queryByText("Phone is required")).toBeNull();
    expect(document.activeElement).toBe(field(/^Name/));
    expect(field(/^Email/).getAttribute("aria-invalid")).toBe("true");
    expect(field(/^Email/).getAttribute("aria-describedby")).toBe("contact-email-error");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends a message without a phone number, because phone is optional", async () => {
    render(<ContactPage freeFrom={1999} />);
    await fillValidForm({ phone: "" });
    send();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).phone).toBe("");
  });

  it("rejects an invalid email or phone and clears an error as the shopper types", async () => {
    render(<ContactPage freeFrom={1999} />);
    await fillValidForm({ email: "user@domain", phone: "12345" });
    send();
    await waitFor(() => expect(screen.getByText("Please enter a valid email address")).toBeTruthy());
    expect(screen.getByText("Please enter a valid 10-digit Indian mobile number")).toBeTruthy();
    await userEvent.type(field(/^Email/), ".com");
    expect(screen.queryByText("Please enter a valid email address")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the trimmed message, names the completed action and offers next steps", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    render(<ContactPage freeFrom={1999} />);
    await fillValidForm({ name: "  Asha Negi " });
    send();
    const heading = await screen.findByRole("heading", { name: "Your message is on its way." });
    expect(fetchMock).toHaveBeenCalledWith("/api/contact", expect.objectContaining({ method: "POST" }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ name: "Asha Negi", email: "asha@example.com", phone: "9876543210", subject: "Delivery", message: "Do you deliver to 110001?" });
    expect(document.activeElement).toBe(heading);
    expect(screen.getByText(/Thank you, Asha\. We will reply to/)).toBeTruthy();
    const sent = screen.getByRole("status");
    expect(within(sent).getByRole("link", { name: "Shop the pantry" }).getAttribute("href")).toBe("/shop");
    expect(within(sent).getByRole("link", { name: "Delivery questions" }).getAttribute("href")).toBe("/faqs#delivery");

    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Send another message" })); });
    expect(field(/^Name/).value).toBe("");
    expect(document.activeElement).toBe(field(/^Name/));
  });

  it("keeps the message and offers other channels when the server refuses it", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Too many submissions. Please try again later." }) });
    render(<ContactPage freeFrom={1999} />);
    await fillValidForm();
    send();
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Too many submissions. Please try again later.");
    expect(within(alert).getByRole("link", { name: "concierge@kosvana.com" })).toBeTruthy();
    expect(field(/^Message/).value).toBe("Do you deliver to 110001?");
    expect((screen.getByRole("button", { name: "Send message" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("shows a plain failure message when the network fails", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(<ContactPage freeFrom={1999} />);
    await fillValidForm();
    send();
    expect((await screen.findByRole("alert")).textContent).toContain("We couldn’t send your message.");
  });
});
