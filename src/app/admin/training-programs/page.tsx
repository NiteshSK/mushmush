import { Suspense } from "react";
import TrainingProgramsAdmin from "@/components/Admin/TrainingPrograms";

export default function AdminTrainingProgramsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="flex justify-center items-center h-64">Loading...</div>}>
        <TrainingProgramsAdmin />
      </Suspense>
    </div>
  );
}
