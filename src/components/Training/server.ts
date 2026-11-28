import { prisma } from "@/lib/prisma";
import type { Course, ScheduleDay, Session, TrainingProgram } from "./programme";

/**
 * Server-side reads of the training programmes, with the same rules as /api/training-programs
 * and /api/training-programs/[id]/schedule: active programmes ordered by type, active days in
 * day order. Values come out as the browser receives them from those routes (dates as text),
 * so the client components can take them as initial data. Instructor contact details stay on
 * the server: the pages show only the name and bio.
 */

const schedules = {
  where: { isActive: true },
  orderBy: { dayNumber: "asc" as const },
  include: { instructor: { select: { id: true, name: true, bio: true } } },
};

type ProgramRow = {
  id: number; name: string; slug: string; description: string; price: number; duration: number; dailyHours: string;
  type: string; isActive: boolean; hasEarlyBirdOffer: boolean;
  earlyBirdPrice: number | null; originalPrice: number | null; earlyBirdEndDate: Date | null;
  schedules: DayRow[];
};

type DayRow = {
  id: number; dayNumber: number; date: Date; title: string; description: string; startTime: string; endTime: string;
  topics: unknown; practicalSessions: unknown; theoreticalSessions: unknown; learningObjectives: unknown; materials: unknown;
  instructor: { id: number; name: string; bio: string | null } | null;
};

function toProgram(row: ProgramRow): TrainingProgram {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: row.price,
    duration: row.duration,
    dailyHours: row.dailyHours,
    type: row.type,
    isActive: row.isActive,
    hasEarlyBirdOffer: row.hasEarlyBirdOffer,
    earlyBirdPrice: row.earlyBirdPrice ?? undefined,
    originalPrice: row.originalPrice ?? undefined,
    earlyBirdEndDate: row.earlyBirdEndDate ? row.earlyBirdEndDate.toISOString() : undefined,
  };
}

// The JSON columns are read defensively by the components (listItems, sessions), as with the API.
function toDay(row: DayRow): ScheduleDay {
  return {
    id: row.id,
    dayNumber: row.dayNumber,
    date: row.date.toISOString(),
    title: row.title,
    description: row.description,
    topics: row.topics as string[],
    practicalSessions: row.practicalSessions as Session[],
    theoreticalSessions: row.theoreticalSessions as Session[],
    learningObjectives: row.learningObjectives as string[],
    materials: row.materials as string[],
    instructor: row.instructor,
    startTime: row.startTime,
    endTime: row.endTime,
  };
}

const toCourse = (row: ProgramRow): Course => ({ program: toProgram(row), days: row.schedules.map(toDay) });

/** Every active programme with its timetable, for the /training page. */
export async function loadCourses(): Promise<Course[]> {
  const rows = await prisma.trainingProgram.findMany({ where: { isActive: true }, orderBy: { type: "asc" }, include: { schedules } });
  return rows.map(toCourse);
}

/** One active programme by slug, or null when there is none. */
export async function loadCourse(slug: string): Promise<Course | null> {
  const row = await prisma.trainingProgram.findFirst({ where: { slug, isActive: true }, include: { schedules } });
  return row ? toCourse(row) : null;
}
