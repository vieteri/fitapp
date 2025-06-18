import { Suspense } from 'react';
import { ExerciseForm } from '@/components/exercises/exercise-form';
import { getExercise } from '@/app/server-actions';
import { ExerciseFormSkeleton } from '@/components/exercises/exercise-form-skeleton';

// Force dynamic rendering to prevent build issues
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

async function ExerciseEditWrapper({ id }: { id: string }) {
  const exercise = await getExercise(id);
  if (!exercise) return null;
  return <ExerciseForm initialValues={exercise} />;
}

export default async function EditExercisePage({ params }: Props) {
  const resolvedParams = await params;
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Exercise</h1>
      <Suspense fallback={<ExerciseFormSkeleton />}>
        <ExerciseEditWrapper id={resolvedParams.id} />
      </Suspense>
    </div>
  );
} 