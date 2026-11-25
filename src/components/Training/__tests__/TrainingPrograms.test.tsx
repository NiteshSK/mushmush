import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { useSession } from "next-auth/react";
import TrainingPrograms from "..";

// The grow section has its own tests; here the catalogue has no grow products, so it stays hidden.
jest.mock("@/hooks/useProducts", () => ({ useProducts: () => ({ products: [], loading: false, error: null }) }));

const programs = [
  { id: 1, name: "Oyster Mushroom Training", slug: "oyster-mushroom-training", description: "Embark on an intensive 5-day journey.", price: 1599, duration: 5, dailyHours: "5-6 Hours ", type: "OYSTER", isActive: true, hasEarlyBirdOffer: false },
  { id: 2, name: "Shitake Mushroom Training", slug: "shitake-mushroom-training", description: "Shiitake on sawdust blocks.", price: 2499, duration: 5, dailyHours: "5-6 hours", type: "SHIITAKE", isActive: true, hasEarlyBirdOffer: false },
];
const days = (dates: string[]) => dates.map((date, index) => ({ id: index + 1, dayNumber: index + 1, date: `${date}T00:00:00.000Z`, title: `Day ${index + 1}`, startTime: "09:00", endTime: "17:00" }));
const json = (body: unknown, status = 200) => Promise.resolve({ ok: status < 400, status, json: async () => body });

beforeEach(() => {
  (useSession as jest.Mock).mockReturnValue({ status: "unauthenticated", data: null });
});

describe("Training programmes page", () => {
  it("puts dates, availability, fee and Register before the description", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === "/api/training-programs") return json(programs);
      if (url === "/api/training-programs/1/schedule") return json(days(["2099-01-19", "2099-01-20", "2099-01-23"]));
      if (url === "/api/training-programs/2/schedule") return json([]);
      return json({}, 404);
    });

    render(<TrainingPrograms />);
    const oyster = await screen.findByRole("article", { name: "Oyster Mushroom Training" });

    expect(within(oyster).getByText("19–23 January 2099")).toBeInTheDocument();
    expect(within(oyster).getByText("Upcoming batch")).toBeInTheDocument();
    expect(within(oyster).getByText("₹1,599")).toBeInTheDocument();
    expect(within(oyster).getByText("09:00–17:00 each day")).toBeInTheDocument();
    const register = within(oyster).getByRole("link", { name: "Register" });
    expect(register).toHaveAttribute("href", "/auth/signin?callbackUrl=%2Ftraining");
    expect(register).toHaveAccessibleDescription(/Sign in to register/);
    const description = within(oyster).getByText("Embark on an intensive 5-day journey.");
    expect(register.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(oyster).getByRole("link", { name: /Day-by-day schedule/ })).toHaveAttribute("href", "/training/oyster-mushroom-training/schedule");

    const shiitake = screen.getByRole("article", { name: "Shitake Mushroom Training" });
    expect(within(shiitake).getByText("Not announced")).toBeInTheDocument();
    // No date today or later: no registration or payment, only an enquiry.
    expect(within(shiitake).queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
    expect(within(shiitake).getByRole("link", { name: "Ask about the next batch" })).toHaveAttribute("href", "/contact?subject=Next%20batch%3A%20Shitake%20Mushroom%20Training");
    expect(within(shiitake).getByText("Daily hours: 5-6 hours")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "How registration works" })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/certificat|expert-led|seats? (left|available)/i);
  });

  it("replaces Register with an enquiry when the batch has ended, even for a signed-in shopper", async () => {
    (useSession as jest.Mock).mockReturnValue({ status: "authenticated", data: { user: { id: "u1", name: "Asha" } } });
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === "/api/training-programs") return json(programs.slice(0, 1));
      if (url.startsWith("/api/training-registrations/check")) return json({ isRegistered: false });
      return json(days(["2026-01-19", "2026-01-23"]));
    });
    render(<TrainingPrograms />);
    const oyster = await screen.findByRole("article", { name: "Oyster Mushroom Training" });

    expect(within(oyster).getByText("This batch has ended. We’ll tell you when the next dates are set.")).toBeInTheDocument();
    expect(within(oyster).getByRole("link", { name: "Ask about the next batch" })).toHaveAttribute("href", "/contact?subject=Next%20batch%3A%20Oyster%20Mushroom%20Training");
    expect(within(oyster).queryByRole("button", { name: "Register" })).not.toBeInTheDocument();
    expect(within(oyster).queryByText(/pay by UPI/)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "How registration works" })).not.toBeInTheDocument();
    expect(screen.getByText("Dates, fees and details for each course. Ask us about the next batch.")).toBeInTheDocument();
  });

  it("offers a retry when the programmes fail to load", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => json({ error: "down" }, 500));
    render(<TrainingPrograms />);

    expect(await screen.findByRole("heading", { name: "We couldn’t load the training courses" })).toBeInTheDocument();
    (global.fetch as jest.Mock).mockImplementation((url: string) => url === "/api/training-programs" ? json(programs.slice(0, 1)) : json([]));
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("article", { name: "Oyster Mushroom Training" })).toBeInTheDocument();
  });

  it("still shows a programme when its timetable fails to load", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => url === "/api/training-programs" ? json(programs.slice(0, 1)) : json({ error: "down" }, 500));
    render(<TrainingPrograms />);
    const oyster = await screen.findByRole("article", { name: "Oyster Mushroom Training" });
    expect(within(oyster).getByText("We couldn’t load the dates. Refresh to try again.")).toBeInTheDocument();
    // Without dates we cannot tell whether the batch has ended, so no payment is offered.
    await waitFor(() => expect(within(oyster).getByRole("link", { name: "Ask about the next batch" })).toBeInTheDocument());
    expect(within(oyster).queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
  });
});
