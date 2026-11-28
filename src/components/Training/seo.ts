import { BUSINESS, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import {
  batchOf, dayKey, formatFee, formatRange, indiaToday, programmeFee, schedulePath, sharedHours, takesRegistrations,
  type Course, type TrainingProgram,
} from "./programme";

/**
 * Search-engine text and schema.org structured data for the training pages. Pure: it reads a
 * course as the server loads it and leaves out what the database does not hold. Google's Course
 * info guidelines ask for offers and a course instance; both are left out while no batch takes
 * registrations, so search results never offer a batch that has ended.
 */

const COURSE_TOPICS: Record<string, string> = {
  OYSTER: "Oyster mushroom",
  BUTTON: "Button mushroom",
  SHIITAKE: "Shiitake mushroom",
  GANODERMA: "Ganoderma mushroom",
};

const days = (count: number) => `${count} ${count === 1 ? "day" : "days"}`;

/** "Oyster mushroom cultivation training in Dehradun (5 days) | Kosvana" */
export function courseTitle(program: Pick<TrainingProgram, "name" | "type" | "duration">) {
  const subject = COURSE_TOPICS[program.type] ? `${COURSE_TOPICS[program.type]} cultivation training` : program.name;
  return `${subject} in Dehradun (${days(program.duration)}) | ${SITE_NAME}`;
}

/** One or two sentences for the search snippet, with the fee the server charges today. */
export function courseDescription({ program, days: timetable }: Course, today = indiaToday()) {
  const subject = COURSE_TOPICS[program.type] ? `${COURSE_TOPICS[program.type].toLowerCase()} cultivation training` : program.name;
  const batch = batchOf(timetable, today);
  const next = batch.state === "upcoming" ? ` Next batch: ${formatRange(batch.start, batch.end)}.` : "";
  return `${program.duration}-day ${subject} at the Kosvana farm in Herbertpur, Dehradun. Fee ${formatFee(programmeFee(program).amount)}.${next} See the day-by-day topics, dates and how to register.`;
}

/** Text without HTML tags or repeated white space. */
export const plainText = (text: string) => text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

/** Price as schema.org wants it: a plain number, no currency sign or thousands separator. */
const priceText = (price: number) => (Number.isInteger(price) ? String(price) : price.toFixed(2));

/** "09:00", "17:30" → "PT8H30M"; null when the times do not parse or do not run forward. */
export function hoursDuration(start: string, end: string) {
  const minutes = (time: string) => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
    return match ? Number(match[1]) * 60 + Number(match[2]) : NaN;
  };
  const length = minutes(end) - minutes(start);
  if (!(length > 0)) return null;
  const hours = Math.floor(length / 60);
  const rest = length % 60;
  return `PT${hours ? `${hours}H` : ""}${rest ? `${rest}M` : ""}`;
}

const provider = { "@type": "Organization", name: SITE_NAME, url: SITE_URL };

/** schema.org Course for one programme, with its batch when the batch takes registrations. */
export function courseJsonLd({ program, days: timetable }: Course, today = indiaToday()) {
  const url = absoluteUrl(schedulePath(program.slug));
  const course: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.name,
    description: plainText(program.description),
    url,
    provider,
  };

  const batch = batchOf(timetable, today);
  if (!timetable || !takesRegistrations(batch) || !("start" in batch)) return course;

  const dates = timetable.map(day => dayKey(day.date)).filter((key, index, all) => all.indexOf(key) === index);
  const hours = sharedHours(timetable);
  const [start, end] = hours ? hours.split("–") : [];
  const duration = start && end ? hoursDuration(start, end) : null;
  const instructors = timetable.reduce<string[]>((names, day) =>
    day.instructor?.name && names.indexOf(day.instructor.name) < 0 ? names.concat(day.instructor.name) : names, []);

  course.offers = [{
    "@type": "Offer",
    category: "Paid",
    price: priceText(programmeFee(program).amount),
    priceCurrency: "INR",
    url,
  }];
  course.hasCourseInstance = [{
    "@type": "CourseInstance",
    courseMode: "Onsite",
    location: { "@type": "Place", name: SITE_NAME, address: { "@type": "PostalAddress", ...BUSINESS.address } },
    startDate: batch.start,
    endDate: batch.end,
    courseSchedule: {
      "@type": "Schedule",
      repeatFrequency: "Daily",
      repeatCount: dates.length,
      startDate: batch.start,
      endDate: batch.end,
      ...(duration ? { duration } : {}),
    },
    ...(instructors.length ? { instructor: instructors.map(name => ({ "@type": "Person", name })) } : {}),
  }];
  return course;
}
