'use client';

import { useEffect, useState, use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { RoutineHeader } from '@/components/routines/routine-header';
import { RoutineDetails } from '@/components/routines/routine-details';
import { ExerciseList } from '@/components/routines/exercise-list';
import { RoutineSkeleton } from '@/components/routines/routine-skeleton';

interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  equipment: string;
  muscle_group: string;
}

interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight: number;
  duration_minutes: number;
  exercise: Exercise;
}

interface Routine {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  routine_exercises: RoutineExercise[];
}

export default function RoutinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [routine, setRoutine] = useState<Routine | null>(null);
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

  if (loading) return <RoutineSkeleton />;
  if (error) return <div className="text-destructive">{error}</div>;
  if (!routine) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <RoutineHeader 
          name={routine.name}
          description={routine.description}
          onEdit={handleEdit}
          onDelete={handleDelete}
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