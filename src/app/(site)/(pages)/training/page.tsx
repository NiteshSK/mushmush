import type { Metadata } from "next";
import TrainingPrograms from "@/components/Training";
import TrainingGuide from "@/components/Training/TrainingGuide";
import PantryShell from "@/components/Pantry/PantryShell";
import JsonLd from "@/components/Seo/JsonLd";
import { toListing, type Course } from "@/components/Training/programme";
import { courseJsonLd } from "@/components/Training/seo";
import { loadCourses } from "@/components/Training/server";
import { breadcrumbJsonLd, shareMetadata } from "@/lib/seo";

const title = "Mushroom cultivation training in Dehradun | Kosvana";
const description = "Five-day oyster and shiitake mushroom cultivation training at the Kosvana farm in Herbertpur, Dehradun, Uttarakhand. See the topics, dates, fees and how to register.";

export const metadata: Metadata = { title, description, ...shareMetadata({ path: "/training", title, description }) };

// Batch status decides whether a course takes registrations, so it is read on every request.
export const dynamic = "force-dynamic";

export default async function TrainingPage() {
  let courses: Course[] | undefined;
  try {
    courses = await loadCourses();
  } catch (error) {
    // The database failed: the browser still loads the courses from /api/training-programs.
    console.error("Training page lookup failed:", error);
  }
  const structured: Record<string, unknown>[] = [breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Training", path: "/training" }])];
  if (courses) structured.push(...courses.map(course => courseJsonLd(course)));

  return (
    <PantryShell browseHref="/shop">
      <JsonLd data={structured} />
      <TrainingPrograms initialListings={courses?.map(course => toListing(course))}>
        <TrainingGuide courses={courses ?? []} />
      </TrainingPrograms>
    </PantryShell>
  );
}
