import React from "react";
import { render, screen, within } from "@testing-library/react";
import { useSession } from "next-auth/react";
import TrainingPrograms from "..";
import TrainingGuide from "../TrainingGuide";
import { toListing, type Course } from "../programme";

jest.mock("@/hooks/useProducts", () => ({ useProducts: () => ({ products: [], loading: false, error: null }) }));

const oyster = { id: 1, name: "Oyster Mushroom Training", slug: "oyster-mushroom-training", description: "Oyster on straw.", price: 1599, duration: 5, dailyHours: "5-6 Hours ", type: "OYSTER", isActive: true, hasEarlyBirdOffer: false };
const shiitake = { ...oyster, id: 2, name: "Shiitake Mushroom Training", slug: "shitake-mushroom-training", description: "Shiitake on sawdust blocks.", price: 2499, type: "SHIITAKE" };
const day = (dayNumber: number, date: string, title: string, topics: string[], instructor: string) => ({
  id: dayNumber, dayNumber, date: `${date}T00:00:00.000Z`, title, description: "", topics, startTime: "09:00", endTime: "17:00",
  practicalSessions: [{ title: "Practice" }], theoreticalSessions: [{ title: "Theory" }], learningObjectives: [], materials: [],
  instructor: { id: instructor.length, name: instructor, bio: null },
});
const pastDays = [
  day(1, "2026-01-19", "Fundamentals & Hands-On Substrate Preparation", ["Mushroom Biology", "Lab Safety"], "Vikrant Rai"),
  day(2, "2026-01-20", "Inoculation, Incubation & Contamination Control", ["Grain Spawn"], "Pravesh Rawat"),
];
const futureDays = pastDays.map(item => ({ ...item, date: item.date.replace("2026", "2099") }));
const courses: Course[] = [{ program: oyster, days: futureDays }, { program: shiitake, days: pastDays }];

beforeEach(() => {
  (useSession as jest.Mock).mockReturnValue({ status: "loading", data: null });
});

describe("Training guide", () => {
  it("lists each course's day-by-day topics from the timetable", () => {
    render(<TrainingGuide courses={courses} />);
    const learn = screen.getByRole("region", { name: "What you learn" });
    const course = within(learn).getByRole("heading", { level: 3, name: "Oyster Mushroom Training" }).parentElement!;
    expect(within(course).getByText("Fundamentals & Hands-On Substrate Preparation")).toBeInTheDocument();
    expect(within(course).getByText("Mushroom Biology, Lab Safety")).toBeInTheDocument();
    expect(within(course).getByText("Each day has theory sessions and practical sessions.")).toBeInTheDocument();
    expect(within(course).getByRole("link", { name: /Full schedule/ })).toHaveAttribute("href", "/training/oyster-mushroom-training/schedule");
  });

  it("says who the courses are for, who teaches and where", () => {
    render(<TrainingGuide courses={courses} />);
    expect(screen.getByRole("region", { name: "Who it is for" })).toHaveTextContent("from home growers to people who plan to start a farm");
    expect(screen.getByText("Vikrant Rai and Pravesh Rawat teach the courses. They grow mushrooms full-time at the Kosvana farm in Herbertpur.")).toBeInTheDocument();
    const where = screen.getByRole("region", { name: "Where" });
    expect(where).toHaveTextContent("NH 507, Herbertpur, Dehradun, Uttarakhand 248142");
    expect(within(where).getByRole("link", { name: /Open in Google Maps/ })).toHaveAttribute("href", expect.stringContaining("google.com/maps"));
  });

  it("answers length, fee, registration and next batch from the data", () => {
    render(<TrainingGuide courses={courses} />);
    const questions = screen.getByRole("region", { name: "Common questions" });
    expect(questions).toHaveTextContent("Oyster Mushroom Training: 5 days, 09:00–17:00 each day.");
    expect(questions).toHaveTextContent("Shiitake Mushroom Training: ₹2,499 per participant.");
    expect(questions).toHaveTextContent("Pay the fee by UPI and enter the UPI transaction ID.");
    expect(questions).toHaveTextContent("Oyster Mushroom Training: 19–20 January 2099.");
    expect(questions).toHaveTextContent("The next dates for Shiitake Mushroom Training are not set yet.");
    expect(within(questions).getByRole("link", { name: "Ask about the next Shiitake Mushroom Training batch" }))
      .toHaveAttribute("href", "/contact?subject=Next%20batch%3A%20Shiitake%20Mushroom%20Training");
    expect(document.body.textContent).not.toMatch(/certificat|accommodation|hostel|meal|lunch|guarantee|government|yield|seats? (left|available)/i);
  });

  it("keeps who and where when the courses did not load", () => {
    render(<TrainingGuide courses={[]} />);
    expect(screen.queryByRole("region", { name: "What you learn" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Where" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ask us about the next batch" })).toHaveAttribute("href", "/contact");
  });
});

describe("Training page with server data", () => {
  it("renders the courses at once, without loading them in the browser", () => {
    render(
      <TrainingPrograms initialListings={courses.map(course => toListing(course))}>
        <TrainingGuide courses={courses} />
      </TrainingPrograms>,
    );
    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mushroom cultivation training in Dehradun");
    const card = screen.getByRole("article", { name: "Oyster Mushroom Training" });
    expect(within(card).getByText("₹1,599")).toBeInTheDocument();
    // The session is still loading, as in the server HTML: Register is already a link.
    expect(within(card).getByRole("link", { name: "Register" })).toHaveAttribute("href", "/auth/signin?callbackUrl=%2Ftraining");
    expect(within(screen.getByRole("article", { name: "Shiitake Mushroom Training" })).getByRole("link", { name: "Ask about the next batch" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Common questions" })).toBeInTheDocument();
  });
});
