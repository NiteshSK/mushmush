import { batchOf, batchStatus, takesRegistrations, formatDay, formatRange, indiaToday, listItems, sharedHours } from "../programme";

const day = (date: string, startTime = "09:00", endTime = "17:00") => ({ date, startTime, endTime } as any);

describe("training dates", () => {
  it("reads India's calendar date, which runs 5:30 ahead of UTC", () => {
    expect(indiaToday(new Date("2026-11-23T18:29:00Z"))).toBe("2026-11-23");
    expect(indiaToday(new Date("2026-11-23T18:31:00Z"))).toBe("2026-11-24");
  });

  it("classifies a batch as past, running, upcoming, unscheduled or unknown", () => {
    const days = [day("2026-01-21T00:00:00.000Z"), day("2026-01-19T00:00:00.000Z"), day("2026-01-23T00:00:00.000Z")];
    expect(batchOf(days, "2026-11-24")).toEqual({ state: "past", start: "2026-01-19", end: "2026-01-23" });
    expect(batchOf(days, "2026-01-20")).toMatchObject({ state: "running" });
    expect(batchOf(days, "2026-01-23")).toMatchObject({ state: "running" });
    expect(batchOf(days, "2026-01-18")).toMatchObject({ state: "upcoming" });
    expect(batchOf([], "2026-11-24")).toEqual({ state: "none" });
    expect(batchOf(null)).toEqual({ state: "unknown" });
  });

  it("never presents an ended batch as open", () => {
    expect(batchStatus({ state: "past", start: "2026-01-19", end: "2026-01-23" })).toBe("This batch has ended. We’ll tell you when the next dates are set.");
    expect(takesRegistrations({ state: "past", start: "2026-01-19", end: "2026-01-23" })).toBe(false);
    expect(takesRegistrations({ state: "none" })).toBe(false);
    expect(takesRegistrations({ state: "unknown" })).toBe(false);
    expect(takesRegistrations({ state: "running", start: "2026-01-19", end: "2026-01-23" })).toBe(true);
    expect(takesRegistrations({ state: "upcoming", start: "2027-01-19", end: "2027-01-23" })).toBe(true);
    expect(batchStatus({ state: "none" })).toBe("Dates are not announced yet.");
  });

  it("formats calendar dates without shifting them by time zone", () => {
    expect(formatDay("2026-01-19")).toBe("Mon 19 Jan 2026");
    expect(formatRange("2026-01-19", "2026-01-23")).toBe("19–23 January 2026");
    expect(formatRange("2026-01-28", "2026-02-02")).toBe("28 Jan – 2 Feb 2026");
    expect(formatRange("2026-12-30", "2027-01-03")).toBe("30 Dec 2026 – 3 Jan 2027");
    expect(formatRange("2026-01-19", "2026-01-19")).toBe("19 January 2026");
  });

  it("reports shared daily hours only when every day agrees", () => {
    expect(sharedHours([day("2026-01-19"), day("2026-01-20")])).toBe("09:00–17:00");
    expect(sharedHours([day("2026-01-19"), day("2026-01-20", "10:00")])).toBeNull();
    expect(sharedHours([])).toBeNull();
  });

  it("splits objectives saved as one semicolon-separated string", () => {
    expect(listItems(["Understand Shiitake biology; Identify methods;", "Harvest"])).toEqual(["Understand Shiitake biology", "Identify methods", "Harvest"]);
    expect(listItems(null)).toEqual([]);
  });
});
