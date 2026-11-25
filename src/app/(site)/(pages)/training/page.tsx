import type { Metadata } from "next";
import TrainingPrograms from "@/components/Training";
import PantryShell from "@/components/Pantry/PantryShell";

export const metadata: Metadata = {
  title: "Mushroom cultivation training | Kosvana",
  description: "Dates, fees and registration for Kosvana’s mushroom cultivation courses.",
};

export default function TrainingPage() {
  return (
    <PantryShell browseHref="/shop">
      <TrainingPrograms />
    </PantryShell>
  );
}
