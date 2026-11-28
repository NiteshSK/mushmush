import { CourseNotFound } from "@/components/TrainingSchedule";
import PantryShell from "@/components/Pantry/PantryShell";

/** An unknown or inactive course slug: a 404 with a way back to the open courses. */
export default function TrainingCourseNotFound() {
  return (
    <PantryShell browseHref="/shop">
      <CourseNotFound />
    </PantryShell>
  );
}
