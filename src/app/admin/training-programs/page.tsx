import { Suspense } from "react";
import TrainingProgramsAdmin from "@/components/Admin/TrainingPrograms";
export default function AdminTrainingProgramsPage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-forest border-t-transparent"></div>
          </div>
        }
      >
        <TrainingProgramsAdmin />
      </Suspense>
    </>
  );
}
