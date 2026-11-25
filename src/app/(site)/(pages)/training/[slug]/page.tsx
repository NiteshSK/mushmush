import { redirect } from "next/navigation";

/** The programme page and its schedule are one page. Keep older programme links working. */
export default async function TrainingProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/training/${encodeURIComponent(slug)}/schedule`);
}
