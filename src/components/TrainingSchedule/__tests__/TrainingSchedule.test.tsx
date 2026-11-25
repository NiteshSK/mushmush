import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { useSession } from "next-auth/react";
import TrainingSchedule from "..";

const program = { id: 1, name: "Oyster Mushroom Training", slug: "oyster-mushroom-training", description: "Embark on an intensive 5-day journey.", price: 1599, duration: 5, dailyHours: "5-6 Hours ", type: "OYSTER", isActive: true, hasEarlyBirdOffer: false };
const schedule = [
  {
    id: 11, dayNumber: 1, date: "2026-01-19T00:00:00.000Z", title: "Fundamentals & Substrate Preparation", description: "Mycology and straw substrate.", startTime: "09:00", endTime: "17:00",
    topics: ["Mushroom Biology"], practicalSessions: [{ title: "Straw Pasteurization", duration: "3 hours" }], theoreticalSessions: [{ title: "Intro to Mycology", duration: "2 hours" }],
    learningObjectives: ["Understand the lifecycle; Prepare substrate"], materials: ["Gloves"], instructor: { id: 3, name: "Vikrant Rai", bio: "Grows oyster mushrooms." },
  },
  { id: 12, dayNumber: 2, date: "2026-01-20T00:00:00.000Z", title: "Inoculation", startTime: "09:00", endTime: "17:00", topics: [], practicalSessions: [], theoreticalSessions: [], learningObjectives: [], materials: [], instructor: null },
];
const json = (body: unknown, status = 200) => Promise.resolve({ ok: status < 400, status, json: async () => body });

beforeEach(() => {
  (useSession as jest.Mock).mockReturnValue({ status: "unauthenticated", data: null });
});

describe("Training programme page", () => {
  it("shows dates, fee and Register first, then the description and timetable", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) =>
      url === "/api/training-programs/oyster-mushroom-training" ? json(program) : url === "/api/training-programs/1/schedule" ? json(schedule) : json({}, 404));

    render(<TrainingSchedule programSlug="oyster-mushroom-training" />);
    expect(await screen.findByRole("heading", { level: 1, name: "Oyster Mushroom Training" })).toBeInTheDocument();

    const booking = screen.getByRole("region", { name: "Dates, fee and registration" });
    expect(within(booking).getByText("19–20 January 2026")).toBeInTheDocument();
    expect(within(booking).getByText("₹1,599")).toBeInTheDocument();
    // The batch has ended: no Register or payment, only an enquiry about the next batch.
    expect(within(booking).getByText("This batch has ended. We’ll tell you when the next dates are set.")).toBeInTheDocument();
    expect(within(booking).queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
    const ask = within(booking).getByRole("link", { name: "Ask about the next batch" });
    expect(ask).toHaveAttribute("href", "/contact?subject=Next%20batch%3A%20Oyster%20Mushroom%20Training");
    const about = screen.getByRole("region", { name: "About this course" });
    expect(ask.compareDocumentPosition(about) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText("This timetable is from the batch that ran 19–20 January 2026.")).toBeInTheDocument();
    expect(screen.getByText("Mon 19 Jan 2026")).toBeInTheDocument();
  });

  it("keeps Register when the batch has dates ahead", async () => {
    const future = schedule.map(day => ({ ...day, date: day.date.replace("2026", "2099") }));
    (global.fetch as jest.Mock).mockImplementation((url: string) =>
      url === "/api/training-programs/oyster-mushroom-training" ? json(program) : json(future));

    render(<TrainingSchedule programSlug="oyster-mushroom-training" />);
    const booking = await screen.findByRole("region", { name: "Dates, fee and registration" });
    expect(within(booking).getByRole("link", { name: "Register" })).toHaveAttribute("href", "/auth/signin?callbackUrl=%2Ftraining%2Foyster-mushroom-training%2Fschedule");
    expect(within(booking).queryByRole("link", { name: "Ask about the next batch" })).not.toBeInTheDocument();
    expect(screen.getByText("Next batch: 19–20 January 2099.")).toBeInTheDocument();
  });

  it("expands a day to show its sessions, topics and materials", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) =>
      url === "/api/training-programs/oyster-mushroom-training" ? json(program) : json(schedule));

    render(<TrainingSchedule programSlug="oyster-mushroom-training" />);
    const toggle = await screen.findByRole("button", { name: "Fundamentals & Substrate Preparation" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Straw Pasteurization").closest("[hidden]")).not.toBeNull();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Straw Pasteurization").closest("[hidden]")).toBeNull();
    expect(screen.getByText("Prepare substrate")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show all details" }));
    expect(screen.getByRole("button", { name: "Inoculation" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("heading", { name: "Instructors" })).toBeInTheDocument();
  });

  it("offers a way back for an unknown course", async () => {
    (global.fetch as jest.Mock).mockImplementation(() => json({ error: "Training program not found" }, 404));
    render(<TrainingSchedule programSlug="no-such-course" />);

    expect(await screen.findByRole("heading", { level: 1, name: "We couldn’t find this training course" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See all training courses" })).toHaveAttribute("href", "/training");
    expect(screen.queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
  });

  it("offers a retry when the course fails to load", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error("offline")));
    render(<TrainingSchedule programSlug="oyster-mushroom-training" />);
    expect(await screen.findByRole("heading", { level: 1, name: "We couldn’t load this training course" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
