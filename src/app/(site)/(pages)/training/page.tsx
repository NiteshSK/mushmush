import { Suspense } from "react";
import TrainingPrograms from "@/components/Training";

export const metadata = {
  title: "Mushroom Cultivation Training Programs | MushMush",
  description: "Learn mushroom cultivation with our comprehensive training programs. Expert-led courses in Oyster, Button, Shiitake, and Ganoderma mushroom cultivation.",
};

export default function TrainingPage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<div className="flex justify-center items-center h-64">Loading...</div>}>
        <TrainingPrograms />
      </Suspense>
    </div>
  );
}
