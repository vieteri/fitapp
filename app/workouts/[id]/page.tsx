'use client';

import { useEffect, useState, use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { WorkoutWithExercises } from '@/types/supabase-types';

interface WorkoutPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkoutPage({ params }: WorkoutPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkout() {
      try {
        const response = await fetch(`/api/workouts/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error('Failed to fetch workout');
        }
        const data = await response.json();
        setWorkout(data.workout);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchWorkout();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this workout?')) return;
    
    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete workout');
      
      router.push('/workouts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workout');
    }
  };

  const handleEdit = () => {
    router.push(`/workouts/${id}/edit`);
  };

  if (loading) return <WorkoutSkeleton />;
  if (error) return <div className="text-destructive">{error}</div>;
  if (!workout) return notFound();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{workout.name}</h1>
          <p className="text-sm text-muted-foreground">
            Started {formatDistanceToNow(new Date(workout.created_at), { addSuffix: true })}
          </p>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          {workout.workout_exercises?.map((exercise) => (
            <Card key={exercise.id} className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">
                    {exercise.exercise?.name || 'Unknown Exercise'}
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground">
                  <div>Sets</div>
                  <div>Reps</div>
                  <div>Weight (kg)</div>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-4">
                    <div>{exercise.sets}</div>
                    <div>{exercise.reps}</div>
                    <div>{exercise.weight || '-'}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkoutSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-10 w-24 bg-muted rounded-md animate-pulse" />
        <div className="flex-1">
          <div className="h-8 w-64 bg-muted rounded-md mb-2 animate-pulse" />
          <div className="h-5 w-48 bg-muted rounded-md animate-pulse" />
        </div>
      </div>

      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-6 w-48 bg-muted rounded-md animate-pulse" />
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="grid grid-cols-3 gap-4">
                    <div className="h-10 bg-muted rounded-md animate-pulse" />
                    <div className="h-10 bg-muted rounded-md animate-pulse" />
                    <div className="h-10 bg-muted rounded-md animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 