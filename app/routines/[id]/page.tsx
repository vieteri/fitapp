'use client';

import { useEffect, useState, use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { RoutineHeader } from '@/components/routines/routine-header';
import { RoutineDetails } from '@/components/routines/routine-details';
import { ExerciseList } from '@/components/routines/exercise-list';
import { RoutineSkeleton } from '@/components/routines/routine-skeleton';
import { toast } from 'sonner';
import type { RoutineWithExercises } from '@/types/supabase-types';

export default function RoutinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [routine, setRoutine] = useState<RoutineWithExercises | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoutine() {
      try {
        const response = await fetch(`/api/routines/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error('Failed to fetch routine');
        }
        const data = await response.json();
        setRoutine(data.routine);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchRoutine();
  }, [id]);

  const handleEdit = () => {
    router.push(`/routines/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this routine?')) return;
    
    try {
      const response = await fetch(`/api/routines/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete routine');
      
      router.push('/routines');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete routine');
    }
  };

  const handleCopyToWorkout = () => {
    if (!routine || !routine.routine_exercises?.length) {
      toast.error('No exercises found in this routine');
      return;
    }

    // Create URL parameters to prefill the workout form
    const searchParams = new URLSearchParams();
    searchParams.set('from_routine', routine.id);
    searchParams.set('name', `${routine.name} - ${new Date().toLocaleDateString()}`);
    
    // Navigate to new workout page with prefilled data
    router.push(`/workouts/new?${searchParams.toString()}`);
    toast.success('Redirecting to workout setup...');
  };

  if (loading) return <RoutineSkeleton />;
  if (error) return <div className="text-destructive">{error}</div>;
  if (!routine) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <RoutineHeader 
          name={routine.name}
          description={routine.description || ''}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCopyToWorkout={handleCopyToWorkout}
        />

        <RoutineDetails 
          id={routine.id}
          userId={routine.user_id}
          createdAt={routine.created_at}
          updatedAt={routine.updated_at}
        />

        <ExerciseList 
          exercises={routine.routine_exercises}
        />
      </div>
    </div>
  );
}