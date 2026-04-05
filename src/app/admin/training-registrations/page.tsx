import { Suspense } from "react";
import TrainingRegistrationsAdmin from "@/components/Admin/TrainingRegistrations";
import AdminAuthWrapper from "@/components/Admin/AdminAuthWrapper";

export default function AdminTrainingRegistrationsPage() {
  return (
    <AdminAuthWrapper>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-forest border-t-transparent"></div>
          </div>
        }
      >
        <TrainingRegistrationsAdmin />
      </Suspense>
    </AdminAuthWrapper>
  );
}
