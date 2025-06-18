"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Exercise } from '@/types/supabase-types';
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface ExerciseSet {
  reps: number;
  weight?: number;
  duration_minutes?: number;
}

interface ExerciseWithSets {
  exercise: Exercise;
  sets: ExerciseSet[];
}

function NewWorkoutForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<ExerciseWithSets[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [loadingRoutine, setLoadingRoutine] = useState(false);

  // Check for routine parameters and prefill
  useEffect(() => {
    const fetchDataAndPrefill = async () => {
      try {
        // Fetch available exercises first
        const exercisesResponse = await fetch('/api/exercises');
        if (!exercisesResponse.ok) throw new Error('Failed to fetch exercises');
        const exercisesData = await exercisesResponse.json();
        setExercises(exercisesData.exercises);

        // Check if we're copying from a routine
        const searchParams = new URLSearchParams(window.location.search);
        const routineId = searchParams.get('from_routine');
        const prefillName = searchParams.get('name');

        if (prefillName) {
          setWorkoutName(prefillName);
        }

        if (routineId) {
          setLoadingRoutine(true);
          try {
            const routineResponse = await fetch(`/api/routines/${routineId}`);
            if (!routineResponse.ok) throw new Error('Failed to fetch routine');
            const routineData = await routineResponse.json();
            
            // Convert routine exercises to workout format
            const prefillExercises: ExerciseWithSets[] = routineData.routine.routine_exercises.map((re: any) => {
              const exercise = exercisesData.exercises.find((ex: Exercise) => ex.id === re.exercise_id);
              if (!exercise) return null;
              
              // Create sets based on routine data
              const sets = Array.from({ length: re.sets }, () => ({
                reps: re.reps,
                weight: re.weight,
                duration_minutes: re.duration_minutes
              }));

              return { exercise, sets };
            }).filter(Boolean);

            setSelectedExercises(prefillExercises);
            toast.success(`Loaded ${prefillExercises.length} exercises from routine!`);
          } catch (error) {
            console.error('Error loading routine:', error);
            toast.error('Failed to load routine data');
          } finally {
            setLoadingRoutine(false);
          }
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        toast.error('Failed to load exercises');
      }
    };

    fetchDataAndPrefill();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedExercises.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }

    setLoading(true);
    setSaving(true);
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workoutName || `Workout ${new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}`,
          exercises: selectedExercises.flatMap((ex, exerciseIndex) => 
            ex.sets.map((set, setIndex) => ({
              exercise_id: ex.exercise.id,
              sets: 1,
              reps: set.reps,
              weight: set.weight,
              duration_minutes: set.duration_minutes
            }))
          )
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create workout');
      }

      toast.success('Workout saved successfully!');
      router.push(`/workouts/${data.workout.id}`);
    } catch (error) {
      console.error('Error creating workout:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create workout');
      setSaving(false);
    } finally {
      setLoading(false);
    }
  };

  const addExercise = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    setSelectedExercises(prev => [
      ...prev,
      {
        exercise,
        sets: [{ reps: 10 }] // Start with one set
      }
    ]);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== index));
  };

  const addSet = (exerciseIndex: number) => {
    setSelectedExercises(prev => prev.map((ex, i) => {
      if (i !== exerciseIndex) return ex;
      return {
        ...ex,
        sets: [...ex.sets, { reps: ex.sets[ex.sets.length - 1].reps }]
      };
    }));
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setSelectedExercises(prev => prev.map((ex, i) => {
      if (i !== exerciseIndex) return ex;
      return {
        ...ex,
        sets: ex.sets.filter((_, si) => si !== setIndex)
      };
    }));
  };

  const updateSetDetails = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof ExerciseSet,
    value: string
  ) => {
    setSelectedExercises(prev => prev.map((ex, i) => {
      if (i !== exerciseIndex) return ex;
      return {
        ...ex,
        sets: ex.sets.map((set, si) => {
          if (si !== setIndex) return set;
          return {
            ...set,
            [field]: field === 'reps' ? parseInt(value) || 0 : parseFloat(value) || 0
          };
        })
      };
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">New Workout</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Workout Details</h2>
            {loadingRoutine && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-800 text-sm">
                <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
                Loading routine exercises...
              </div>
            )}
            <div>
              <label htmlFor="workoutName" className="block text-sm font-medium text-muted-foreground mb-2">
                Workout Name
              </label>
              <input
                id="workoutName"
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="Enter workout name (optional)"
              />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Exercises</h2>
            <Select onValueChange={addExercise}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Add exercise" />
              </SelectTrigger>
              <SelectContent>
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedExercises.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              Select an exercise to begin your workout
            </Card>
          ) : (
            selectedExercises.map((ex, exerciseIndex) => (
              <Card key={exerciseIndex} className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{ex.exercise.name}</h3>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSet(exerciseIndex)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Set
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExercise(exerciseIndex)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {ex.sets.map((set, setIndex) => (
                      <div key={setIndex} className="flex items-center gap-4">
                        <div className="w-16 text-sm text-muted-foreground">
                          Set {setIndex + 1}
                        </div>
                        <div className="grid grid-cols-3 gap-4 flex-1">
                          <div>
                            <input
                              type="number"
                              className="w-full px-3 py-1 border rounded-md"
                              value={set.reps}
                              onChange={(e) => updateSetDetails(exerciseIndex, setIndex, 'reps', e.target.value)}
                              min={1}
                              placeholder="Reps"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              className="w-full px-3 py-1 border rounded-md"
                              value={set.weight || ''}
                              onChange={(e) => updateSetDetails(exerciseIndex, setIndex, 'weight', e.target.value)}
                              min={0}
                              step={0.5}
                              placeholder="Weight (kg)"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              className="w-full px-3 py-1 border rounded-md"
                              value={set.duration_minutes || ''}
                              onChange={(e) => updateSetDetails(exerciseIndex, setIndex, 'duration_minutes', e.target.value)}
                              min={0}
                              placeholder="Duration (min)"
                            />
                          </div>
                        </div>
                        {ex.sets.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSet(exerciseIndex, setIndex)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || selectedExercises.length === 0 || saving}
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : loading ? (
              'Starting...'
            ) : (
              'Finish Workout'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewWorkoutPage() {
  return (
    <ErrorBoundary>
      <NewWorkoutForm />
    </ErrorBoundary>
  );
} 