import type { Metadata } from "next";
import TrainingSchedule from "@/components/TrainingSchedule";
import PantryShell from "@/components/Pantry/PantryShell";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const program = await prisma.trainingProgram.findFirst({ where: { slug, isActive: true }, select: { name: true } });
    if (program) return { title: `${program.name}: dates, fee and schedule | Kosvana`, description: `Dates, fee, registration and the day-by-day schedule for ${program.name}.` };
  } catch {
    // Fall back to the generic title below.
  }
  return { title: "Training course | Kosvana", description: "Dates, fee, registration and the day-by-day schedule for a Kosvana training course." };
}

export default async function TrainingSchedulePage({ params }: Props) {
  const { slug } = await params;
  return (
    <PantryShell browseHref="/shop">
      <TrainingSchedule programSlug={slug} />
    </PantryShell>
  );
}
