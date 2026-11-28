import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import TrainingSchedule from "@/components/TrainingSchedule";
import PantryShell from "@/components/Pantry/PantryShell";
import JsonLd from "@/components/Seo/JsonLd";
import { schedulePath, type Course } from "@/components/Training/programme";
import { courseDescription, courseJsonLd, courseTitle } from "@/components/Training/seo";
import { loadCourse } from "@/components/Training/server";
import { breadcrumbJsonLd, shareMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

const fallback = { title: "Training course | Kosvana", description: "Dates, fee, registration and the day-by-day schedule for a Kosvana mushroom cultivation training course." };
// Metadata must not hold back the page when the database is slow.
const METADATA_WAIT_MS = 2000;

/** One lookup per request, shared by the metadata and the page. */
const getCourse = cache((slug: string) => loadCourse(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = schedulePath(slug);
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<"timeout">(resolve => { timer = setTimeout(() => resolve("timeout"), METADATA_WAIT_MS); });
    const course = await Promise.race([getCourse(slug), timeout]);
    if (course === "timeout") return { ...fallback, ...shareMetadata({ path, ...fallback }) };
    if (!course) return { title: "Training course not found | Kosvana", robots: { index: false } };
    const title = courseTitle(course.program);
    const description = courseDescription(course);
    return { title, description, ...shareMetadata({ path: schedulePath(course.program.slug), title, description }) };
  } catch {
    return { ...fallback, ...shareMetadata({ path, ...fallback }) };
  } finally {
    clearTimeout(timer);
  }
}

// Batch status decides whether the course takes registrations, so it is read on every request.
export const dynamic = "force-dynamic";

export default async function TrainingSchedulePage({ params }: Props) {
  const { slug } = await params;
  let course: Course | null | undefined;
  try {
    course = await getCourse(slug);
  } catch (error) {
    // The database failed: the browser still loads the course from /api/training-programs.
    console.error("Training course lookup failed:", error);
  }
  if (course === null) notFound();
  return (
    <PantryShell browseHref="/shop">
      {course && (
        <JsonLd data={[
          courseJsonLd(course),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Training", path: "/training" },
            { name: course.program.name, path: schedulePath(course.program.slug) },
          ]),
        ]} />
      )}
      <TrainingSchedule key={slug} programSlug={slug} initial={course} />
    </PantryShell>
  );
}
