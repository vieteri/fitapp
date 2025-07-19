"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { WorkoutWithExercises } from '@/types/supabase-types';
import { WorkoutForm } from "@/components/workouts/workout-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditWorkoutPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await fetch(`/api/workouts/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/workouts');
            return;
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
    };

    fetchWorkout();
  }, [id, router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="h-8 w-64 bg-muted rounded-md mb-4 animate-pulse" />
        <div className="space-y-4">
          <div className="h-10 bg-muted rounded-md animate-pulse" />
          <div className="h-20 bg-muted rounded-md animate-pulse" />
          <div className="h-40 bg-muted rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  if (!workout) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Workout</h1>
      </div>

      <WorkoutForm 
        initialData={workout}
        onSuccess={(updatedWorkout: WorkoutWithExercises) => {
          router.push(`/workouts/${updatedWorkout.id}`);
        }}
      />
    </div>
  );
} 