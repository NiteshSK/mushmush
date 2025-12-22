import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export default async function TrainingProgramPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    // Wait for params to resolve
    const { slug } = await params;
    // Redirect to schedule page
    redirect(`/training/${slug}/schedule`);
}
