import { Suspense } from "react";
import TrainingRegistrationsAdmin from "@/components/Admin/TrainingRegistrations";

export default function AdminTrainingRegistrationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="flex justify-center items-center h-64">Loading...</div>}>
        <TrainingRegistrationsAdmin />
      </Suspense>
    </div>
  );
}
