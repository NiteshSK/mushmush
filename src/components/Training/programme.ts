import { getTrainingProgramPrice, isEarlyBirdOfferValid } from "@/lib/utils";
import { rupees } from "../Pantry/catalogue";

export interface TrainingProgram {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration: number;
  dailyHours: string;
  type: string;
  isActive: boolean;
  hasEarlyBirdOffer: boolean;
  earlyBirdPrice?: number;
  originalPrice?: number;
  earlyBirdEndDate?: string | Date;
}

export interface Session {
  title: string;
  duration?: string;
  description?: string;
}

export interface Instructor {
  id: number;
  name: string;
  bio?: string | null;
}

export interface ScheduleDay {
  id: number;
  dayNumber: number;
  date: string;
  title: string;
  description?: string;
  topics?: string[];
  practicalSessions?: Session[];
  theoreticalSessions?: Session[];
  learningObjectives?: string[];
  materials?: string[];
  instructor?: Instructor | null;
  startTime: string;
  endTime: string;
}

/**
 * The batch a programme's timetable describes. Each programme stores one timetable, so its
 * first and last days are the batch dates. "unknown" means the timetable failed to load.
 */
export type Batch =
  | { state: "none" | "unknown" }
  | { state: "upcoming" | "running" | "past"; start: string; end: string };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Admin forms save each training day as UTC midnight, so the first ten characters are the calendar date. */
export const dayKey = (date: string | Date) => (typeof date === "string" ? date : date.toISOString()).slice(0, 10);
const utc = (key: string) => new Date(`${key}T00:00:00Z`);

/** Today's calendar date in India, where the training takes place, as YYYY-MM-DD. */
export function indiaToday(now = new Date()) {
  const shifted = new Date(now.getTime() + 330 * 60 * 1000); // IST is UTC+05:30 all year.
  return shifted.toISOString().slice(0, 10);
}

export function batchOf(days: Pick<ScheduleDay, "date">[] | null, today = indiaToday()): Batch {
  if (!days) return { state: "unknown" };
  const keys = days.map(day => dayKey(day.date)).sort();
  if (keys.length === 0) return { state: "none" };
  const start = keys[0];
  const end = keys[keys.length - 1];
  const state = end < today ? "past" : start > today ? "upcoming" : "running";
  return { state, start, end };
}

/** "Mon 19 Jan 2026" */
export function formatDay(key: string) {
  const date = utc(key);
  return `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()].slice(0, 3)} ${date.getUTCFullYear()}`;
}

/** "19–23 January 2026", "28 Jan – 2 Feb 2026" or "30 Dec 2026 – 3 Jan 2027" */
export function formatRange(start: string, end: string) {
  const a = utc(start);
  const b = utc(end);
  const long = (date: Date) => `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  const short = (date: Date) => `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()].slice(0, 3)}`;
  if (start === end) return long(a);
  if (a.getUTCFullYear() !== b.getUTCFullYear()) return `${short(a)} ${a.getUTCFullYear()} – ${short(b)} ${b.getUTCFullYear()}`;
  if (a.getUTCMonth() !== b.getUTCMonth()) return `${short(a)} – ${short(b)} ${b.getUTCFullYear()}`;
  return `${a.getUTCDate()}–${long(b)}`;
}

/** What a shopper needs to know about the dates before deciding to register. */
export function batchStatus(batch: Batch) {
  switch (batch.state) {
    case "upcoming": return "Upcoming batch";
    case "running": return "This batch is running now. No later dates are listed yet.";
    case "past": return "This batch has ended. We’ll tell you when the next dates are set.";
    case "none": return "Dates are not announced yet.";
    default: return "We couldn’t load the dates. Refresh to try again.";
  }
}

export const hasUpcomingBatch = (batch: Batch) => batch.state === "upcoming";

/**
 * Registration and payment stay open only while a schedule date is today or later. An unknown
 * timetable (failed to load) also stays closed, so nobody pays for a batch that may have ended.
 */
export const takesRegistrations = (batch: Batch) => batch.state === "upcoming" || batch.state === "running";

/** The fee the server charges at registration, plus the regular fee while an early-bird offer runs. */
export function programmeFee(program: TrainingProgram) {
  const earlyBird = isEarlyBirdOfferValid(program);
  return {
    amount: getTrainingProgramPrice(program),
    regular: earlyBird ? program.originalPrice : undefined,
    earlyBirdEnds: earlyBird && program.earlyBirdEndDate ? dayKey(new Date(program.earlyBirdEndDate)) : undefined,
  };
}

export const formatFee = (amount: number) => rupees.format(amount);

const TYPE_LABELS: Record<string, string> = {
  OYSTER: "Oyster mushrooms",
  BUTTON: "Button mushrooms",
  SHIITAKE: "Shiitake mushrooms",
  GANODERMA: "Ganoderma mushrooms",
};
export const typeLabel = (type: string) => TYPE_LABELS[type] ?? "Mushroom cultivation";

/** One start and end time when every day shares it, otherwise null. */
export function sharedHours(days: ScheduleDay[]) {
  if (days.length === 0) return null;
  const first = `${days[0].startTime}–${days[0].endTime}`;
  return days.every(day => `${day.startTime}–${day.endTime}` === first) ? first : null;
}

/** Some objectives are saved as one string separated by semicolons. Show each as its own item. */
export const listItems = (items: unknown) =>
  (Array.isArray(items) ? items : [])
    .filter((item): item is string => typeof item === "string")
    .reduce<string[]>((all, item) => all.concat(item.split(/;\s*/)), [])
    .map(item => item.trim())
    .filter(Boolean);

export const schedulePath = (slug: string) => `/training/${encodeURIComponent(slug)}/schedule`;

export type Listing = { program: TrainingProgram; batch: Batch; hours: string | null };

/** Programmes with their batch dates; shared by the training page, the homepage and search. */
export async function loadListings(): Promise<Listing[]> {
  const response = await fetch("/api/training-programs");
  if (!response.ok) throw new Error(`Programmes failed with ${response.status}`);
  const programs: TrainingProgram[] = await response.json();
  return Promise.all(programs.map(async (program) => {
    try {
      const schedule = await fetch(`/api/training-programs/${program.id}/schedule`);
      if (!schedule.ok) throw new Error();
      const days: ScheduleDay[] = await schedule.json();
      return { program, batch: batchOf(days), hours: sharedHours(days) };
    } catch {
      return { program, batch: batchOf(null), hours: null };
    }
  }));
}
