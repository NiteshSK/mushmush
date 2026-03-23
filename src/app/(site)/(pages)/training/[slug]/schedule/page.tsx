import TrainingSchedule from "@/components/TrainingSchedule";

export const metadata = {
  title: "Training Schedule | Kosvana",
  description: "View detailed training schedule with practical and theoretical sessions for cultivation programs.",
};

export default async function TrainingSchedulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <TrainingSchedule programSlug={slug} />;
}
