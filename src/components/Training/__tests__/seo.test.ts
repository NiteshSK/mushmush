import { courseDescription, courseJsonLd, courseTitle, hoursDuration, plainText } from "../seo";
import type { Course } from "../programme";

const program = {
  id: 1, name: "Oyster Mushroom Training", slug: "oyster-mushroom-training",
  description: "Embark on an intensive <b>5-day</b> journey.\n\nYou will learn substrate preparation.",
  price: 1599, duration: 5, dailyHours: "5-6 Hours ", type: "OYSTER", isActive: true, hasEarlyBirdOffer: false,
};
const day = (dayNumber: number, date: string, instructor: string | null) => ({
  id: dayNumber, dayNumber, date: `${date}T00:00:00.000Z`, title: `Day ${dayNumber}`, startTime: "09:00", endTime: "17:00",
  instructor: instructor ? { id: instructor.length, name: instructor, bio: null } : null,
});
const course = (days: Course["days"]): Course => ({ program, days });
const batch = [day(1, "2027-01-18", "Vikrant Rai"), day(2, "2027-01-19", "Pravesh Rawat"), day(3, "2027-01-20", "Vikrant Rai"), day(4, "2027-01-21", null), day(5, "2027-01-22", null)];

describe("Course structured data", () => {
  it("describes an open batch as an onsite course instance with its fee", () => {
    const data = courseJsonLd(course(batch), "2026-11-28") as any;
    expect(data).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Course",
      name: "Oyster Mushroom Training",
      description: "Embark on an intensive 5-day journey. You will learn substrate preparation.",
      url: "https://www.kosvana.com/training/oyster-mushroom-training/schedule",
      provider: { "@type": "Organization", name: "Kosvana", url: "https://www.kosvana.com" },
      offers: [{ "@type": "Offer", category: "Paid", price: "1599", priceCurrency: "INR", url: "https://www.kosvana.com/training/oyster-mushroom-training/schedule" }],
    });
    expect(data.hasCourseInstance).toEqual([{
      "@type": "CourseInstance",
      courseMode: "Onsite",
      location: {
        "@type": "Place", name: "Kosvana",
        address: { "@type": "PostalAddress", streetAddress: "NH 507, Herbertpur", addressLocality: "Dehradun", addressRegion: "Uttarakhand", postalCode: "248142", addressCountry: "IN" },
      },
      startDate: "2027-01-18",
      endDate: "2027-01-22",
      courseSchedule: { "@type": "Schedule", repeatFrequency: "Daily", repeatCount: 5, startDate: "2027-01-18", endDate: "2027-01-22", duration: "PT8H" },
      instructor: [{ "@type": "Person", name: "Vikrant Rai" }, { "@type": "Person", name: "Pravesh Rawat" }],
    }]);
  });

  it("keeps a running batch, which still takes registrations", () => {
    expect(courseJsonLd(course(batch), "2027-01-20")).toHaveProperty("hasCourseInstance");
  });

  it("leaves out the instance and offer when no batch takes registrations", () => {
    for (const days of [batch, [], null]) {
      const data = courseJsonLd(course(days), "2027-02-01");
      expect(data).not.toHaveProperty("hasCourseInstance");
      expect(data).not.toHaveProperty("offers");
      expect(data).toMatchObject({ "@type": "Course", name: "Oyster Mushroom Training", provider: { name: "Kosvana" } });
    }
  });

  it("charges the early-bird fee while the offer runs", () => {
    const earlyBird = { ...program, hasEarlyBirdOffer: true, earlyBirdPrice: 1299, originalPrice: 1599, earlyBirdEndDate: "2099-01-01T00:00:00.000Z" };
    expect((courseJsonLd({ program: earlyBird, days: batch }, "2026-11-28") as any).offers[0].price).toBe("1299");
  });

  it("omits the daily duration when the days have different hours", () => {
    const uneven = batch.map((item, index) => index === 0 ? { ...item, endTime: "13:00" } : item);
    expect((courseJsonLd(course(uneven), "2026-11-28") as any).hasCourseInstance[0].courseSchedule).not.toHaveProperty("duration");
  });

  it("never invents credentials, ratings or language", () => {
    const text = JSON.stringify(courseJsonLd(course(batch), "2026-11-28"));
    expect(text).not.toMatch(/educationalCredentialAwarded|aggregateRating|review|inLanguage|certif/i);
  });
});

describe("Course page text", () => {
  it("names the mushroom, the place and the length in the title", () => {
    expect(courseTitle(program)).toBe("Oyster mushroom cultivation training in Dehradun (5 days) | Kosvana");
    expect(courseTitle({ ...program, type: "SHIITAKE" })).toBe("Shiitake mushroom cultivation training in Dehradun (5 days) | Kosvana");
    expect(courseTitle({ ...program, type: "OTHER", name: "Mushroom Farming Basics", duration: 1 })).toBe("Mushroom Farming Basics in Dehradun (1 day) | Kosvana");
  });

  it("gives the fee, and the next batch only while it is ahead", () => {
    expect(courseDescription(course(batch), "2026-11-28")).toBe("5-day oyster mushroom cultivation training at the Kosvana farm in Herbertpur, Dehradun. Fee ₹1,599. Next batch: 18–22 January 2027. See the day-by-day topics, dates and how to register.");
    expect(courseDescription(course(batch), "2027-03-01")).not.toMatch(/Next batch/);
  });

  it("reads plain text and durations", () => {
    expect(plainText("<p>Grow   oyster</p>\nmushrooms")).toBe("Grow oyster mushrooms");
    expect(hoursDuration("09:00", "17:30")).toBe("PT8H30M");
    expect(hoursDuration("09:00", "09:45")).toBe("PT45M");
    expect(hoursDuration("17:00", "09:00")).toBeNull();
    expect(hoursDuration("9 am", "5 pm")).toBeNull();
  });
});
