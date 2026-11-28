import type { Metadata } from "next";
import TrainingPrograms from "@/components/Training";
import PantryShell from "@/components/Pantry/PantryShell";
import { shareMetadata } from "@/lib/seo";

const title = "Mushroom cultivation training in Dehradun | Kosvana";
const description = "Five-day oyster and shiitake mushroom growing courses at Kosvana in Herbertpur, Dehradun. See dates and fees, and register online.";

export const metadata: Metadata = { title, description, ...shareMetadata({ path: "/training", title, description }) };

export default function TrainingPage() {
  return (
    <PantryShell browseHref="/shop">
      <TrainingPrograms />
    </PantryShell>
  );
}
