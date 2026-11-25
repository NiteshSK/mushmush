import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import RegisterAction, { PAYMENT_PENDING_MESSAGE } from "../RegisterAction";

// userEvent types each character; leave room when the machine is busy.
jest.setTimeout(20000);

jest.mock("react-qr-code", () => ({ __esModule: true, default: () => <svg data-testid="qr" /> }));

const program = {
  id: 7,
  name: "Oyster Mushroom Training",
  slug: "oyster-mushroom-training",
  description: "Five days of oyster cultivation.",
  price: 1599,
  duration: 5,
  dailyHours: "5-6 Hours ",
  type: "OYSTER",
  isActive: true,
  hasEarlyBirdOffer: false,
};

const json = (body: unknown, status = 200) => Promise.resolve({ ok: status < 400, status, json: async () => body });
const signedIn = () => (useSession as jest.Mock).mockReturnValue({ status: "authenticated", data: { user: { id: "u1", name: "Asha Rawat", email: "asha@example.test" } } });

type Route = (url: string, init?: RequestInit) => Promise<unknown> | undefined;
const serve = (route: Route) => (global.fetch as jest.Mock).mockImplementation((url: string, init?: RequestInit) => route(url, init) ?? json({ error: "unexpected" }, 500));

describe("RegisterAction", () => {
  it("sends a signed-out shopper to sign-in and back to this page", () => {
    (useSession as jest.Mock).mockReturnValue({ status: "unauthenticated", data: null });
    render(<RegisterAction program={program} returnTo="/training/oyster-mushroom-training/schedule" />);

    const register = screen.getByRole("link", { name: "Register" });
    expect(register).toHaveAttribute("href", "/auth/signin?callbackUrl=%2Ftraining%2Foyster-mushroom-training%2Fschedule");
    expect(register).toHaveAccessibleDescription(/Sign in to register/);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("registers, opens UPI payment with the fee, and keeps the registration pending after payment", async () => {
    signedIn();
    serve((url, init) => {
      if (url.startsWith("/api/training-registrations/check")) return json({ isRegistered: false });
      if (url === "/api/training-registrations" && init?.method === "POST") return json({
        id: "reg-1", registrationNumber: "TR123", status: "PENDING", participantName: "Asha Rawat", totalAmount: 1599, trainingProgram: { name: program.name },
      }, 201);
      if (url === "/api/training-payments" && init?.method === "POST") return json({ success: true, message: "Payment details submitted. We will confirm your registration after we verify the payment." });
      return undefined;
    });

    render(<RegisterAction program={program} returnTo="/training" />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith("/api/training-registrations/check?programId=7", expect.anything()));

    fireEvent.click(screen.getByRole("button", { name: "Register" }));
    const dialog = screen.getByRole("dialog", { name: /Register for Oyster Mushroom Training/ });
    await userEvent.type(within(dialog).getByLabelText("Mobile number"), "9876543210");
    await userEvent.type(within(dialog).getByLabelText("Street address"), "12 Canal Road");
    await userEvent.type(within(dialog).getByLabelText("City"), "Dehradun");
    await userEvent.type(within(dialog).getByLabelText("State"), "Uttarakhand");
    await userEvent.type(within(dialog).getByLabelText("PIN code"), "248001");
    fireEvent.click(within(dialog).getByRole("button", { name: /Continue to Payment/ }));

    const payment = await screen.findByRole("dialog", { name: "Pay ₹1,599 by UPI" });
    expect(within(payment).getByLabelText("UPI transaction ID")).toHaveFocus();
    expect(within(payment).getByText("₹1,599", { selector: "strong" })).toBeInTheDocument();
    expect(within(payment).getByText("TR123")).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: /Register for/ })).not.toBeInTheDocument();
    // Before payment, the page offers a way back to payment and never says confirmed.
    expect(screen.getByRole("status")).toHaveTextContent("Your registration is pending. Pay the fee to continue.");

    await userEvent.type(within(payment).getByLabelText("UPI transaction ID"), "412345678901");
    fireEvent.click(within(payment).getByRole("button", { name: "Submit payment details" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(PAYMENT_PENDING_MESSAGE));
    // One toast, from the shared payment modal, with the server's pending message.
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/after we verify the payment/));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(PAYMENT_PENDING_MESSAGE);
    expect(status).toHaveTextContent("Registration TR123");
    expect(status).toHaveFocus();
    expect(document.body.textContent).not.toMatch(/confirmed/i);
    expect(screen.queryByRole("button", { name: /Pay/ })).not.toBeInTheDocument();
  });

  it("closes the payment modal with Escape and offers to pay again", async () => {
    signedIn();
    serve((url, init) => {
      if (url.startsWith("/api/training-registrations/check")) return json({ isRegistered: true, registration: { id: "reg-2", registrationNumber: "TR456", status: "PENDING", paymentStatus: "PENDING" } });
      if (url.startsWith("/api/training-payments?registrationId=reg-2") && !init?.method) return json({ id: "reg-2", status: "PENDING", totalAmount: 1599, upi_payments: [] });
      return undefined;
    });

    render(<RegisterAction program={program} returnTo="/training" />);
    const pay = await screen.findByRole("button", { name: "Pay ₹1,599 by UPI" });
    expect(screen.getByRole("status")).toHaveTextContent("Registration TR456");
    expect(screen.queryByRole("button", { name: "Register" })).not.toBeInTheDocument();

    fireEvent.click(pay);
    const payment = screen.getByRole("dialog", { name: "Pay ₹1,599 by UPI" });
    // The shared modal closes on the dialog's native cancel event (Escape).
    fireEvent(payment, new Event("cancel", { cancelable: true }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pay ₹1,599 by UPI" })).toHaveFocus();
  });

  it("shows a submitted payment as pending verification, not confirmed", async () => {
    signedIn();
    serve((url) => {
      if (url.startsWith("/api/training-registrations/check")) return json({ isRegistered: true, registration: { id: "reg-3", registrationNumber: "TR789", status: "PENDING", paymentStatus: "PENDING" } });
      if (url.startsWith("/api/training-payments?registrationId=reg-3")) return json({ id: "reg-3", status: "PENDING", totalAmount: 1599, upi_payments: [{ status: "PENDING" }] });
      return undefined;
    });

    render(<RegisterAction program={program} returnTo="/training" />);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(PAYMENT_PENDING_MESSAGE));
    expect(screen.queryByRole("button", { name: /Pay|Register/ })).not.toBeInTheDocument();
  });

  it("says confirmed only when the server has confirmed the registration", async () => {
    signedIn();
    serve((url) => url.startsWith("/api/training-registrations/check")
      ? json({ isRegistered: true, registration: { id: "reg-4", registrationNumber: "TR000", status: "CONFIRMED", paymentStatus: "VERIFIED" } })
      : undefined);

    render(<RegisterAction program={program} returnTo="/training" />);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Your registration is confirmed."));
  });

  it("takes no payment for an ended batch, even with an unpaid registration", async () => {
    signedIn();
    serve((url) => {
      if (url.startsWith("/api/training-registrations/check")) return json({ isRegistered: true, registration: { id: "reg-5", registrationNumber: "TR555", status: "PENDING", paymentStatus: "PENDING" } });
      if (url.startsWith("/api/training-payments?registrationId=reg-5")) return json({ id: "reg-5", status: "PENDING", totalAmount: 1599, upi_payments: [] });
      return undefined;
    });

    render(<RegisterAction program={program} returnTo="/training" open={false} />);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Registration TR555"));
    expect(screen.queryByRole("button", { name: /Pay/ })).not.toBeInTheDocument();
  });

  it("offers an enquiry instead of Register when the batch has ended", () => {
    (useSession as jest.Mock).mockReturnValue({ status: "unauthenticated", data: null });
    render(<RegisterAction program={program} returnTo="/training" open={false} />);
    expect(screen.getByRole("link", { name: "Ask about the next batch" })).toHaveAttribute("href", "/contact?subject=Next%20batch%3A%20Oyster%20Mushroom%20Training");
    expect(screen.queryByText("Register")).not.toBeInTheDocument();
  });

  it("keeps Register available when the status check fails", async () => {
    signedIn();
    serve(() => json({ error: "down" }, 500));

    render(<RegisterAction program={program} returnTo="/training" note="You can give a preferred start date." />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "Register" })).toHaveAccessibleDescription("You pay by UPI after you register. You can give a preferred start date.");
  });
});
