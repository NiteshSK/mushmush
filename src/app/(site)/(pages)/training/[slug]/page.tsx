import { redirect } from 'next/navigation';

export default function TrainingProgramPage({
    params
}: {
    params: { slug: string }
}) {
    // Redirect to schedule page
    redirect(`/training/${params.slug}/schedule`);
}
