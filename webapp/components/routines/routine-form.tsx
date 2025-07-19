"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save, Dumbbell, Copy } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Exercise, Routine, RoutineExercise, ExerciseSet } from '@/types/supabase-types';

interface RoutineFormProps {
  initialData?: Routine & {
    routine_exercises?: (RoutineExercise & {
      exercise?: Exercise;
      exercise_sets?: ExerciseSet[];
    })[];
  };
  onSuccess: (routine: Routine) => void;
}

interface SetData {
  reps: number;
  weight: number | null;
  duration_minutes: number | null;
}

interface ExerciseData {
  id?: string;
  exercise_id: string;
  sets: SetData[];
  order_index?: number;
  exercise?: Exercise | null;
}

export function RoutineForm({ initialData, onSuccess }: RoutineFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [exercises, setExercises] = useState<ExerciseData[]>(() => {
    if (!initialData?.routine_exercises) return [];
    
    return initialData.routine_exercises.map(re => ({
      id: re.id,
      exercise_id: re.exercise_id,
      sets: re.exercise_sets && re.exercise_sets.length > 0 
        ? re.exercise_sets
            .sort((a, b) => a.set_number - b.set_number)
            .map(set => ({
              reps: set.reps,
              weight: set.weight,
              duration_minutes: set.duration_minutes
            }))
        : Array.from({ length: re.sets }, () => ({
            reps: re.reps,
            weight: re.weight,
            duration_minutes: re.duration_minutes
          })),
      order_index: re.order_index,
      exercise: re.exercise
    }));
  });
  const [loadingExercises, setLoadingExercises] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch('/api/exercises');
        if (!response.ok) throw new Error('Failed to fetch exercises');
        const data = await response.json();
        setAvailableExercises(data.exercises);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setLoadingExercises(false);
      }
    };

    fetchExercises();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || exercises.length === 0) {
      setError("Please add a name and at least one exercise");
      return;
    }
    
    // Validate that all exercises have an exercise_id and at least one set
    if (exercises.some(ex => !ex.exercise_id || ex.sets.length === 0)) {
      setError("Please select an exercise for all items and ensure each has at least one set");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const url = initialData 
        ? `/api/routines/${initialData.id}`
        : '/api/routines';
      
      const method = initialData ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          exercises: exercises.map((ex, index) => ({
            id: ex.id,
            exercise_id: ex.exercise_id,
            sets: ex.sets,
            order_index: index
          }))
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save routine');
      }
      
      const data = await response.json();
      onSuccess(data.routine);
    } catch (error) {
      console.error('Error saving routine:', error);
      setError(error instanceof Error ? error.message : 'Failed to save routine');
    } finally {
      setLoading(false);
    }
  };

  const addExercise = () => {
    setExercises(prev => [
      ...prev, 
      {
        exercise_id: '',
        sets: [{ reps: 10, weight: null, duration_minutes: null }]
      }
    ]);
  };

  const removeExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: string, value: any) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // If changing exercise_id, try to find the exercise details
      if (field === 'exercise_id' && value) {
        const selectedExercise = availableExercises.find(ex => ex.id === value);
        updated[index].exercise = selectedExercise || null;
      }
      
      return updated;
    });
  };

  const addSet = (exerciseIndex: number) => {
    setExercises(prev => {
      const updated = [...prev];
      const lastSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1];
      updated[exerciseIndex] = {
        ...updated[exerciseIndex],
        sets: [
          ...updated[exerciseIndex].sets,
          { 
            reps: lastSet?.reps || 10, 
            weight: lastSet?.weight || null, 
            duration_minutes: lastSet?.duration_minutes || null 
          }
        ]
      };
      return updated;
    });
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setExercises(prev => {
      const updated = [...prev];
      if (updated[exerciseIndex].sets.length > 1) {
        updated[exerciseIndex] = {
          ...updated[exerciseIndex],
          sets: updated[exerciseIndex].sets.filter((_, i) => i !== setIndex)
        };
      }
      return updated;
    });
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof SetData, value: any) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex] = {
        ...updated[exerciseIndex],
        sets: updated[exerciseIndex].sets.map((set, i) => {
          if (i !== setIndex) return set;
          return { ...set, [field]: value };
        })
      };
      return updated;
    });
  };

  const copySetToAll = (exerciseIndex: number, setIndex: number) => {
    const sourceSet = exercises[exerciseIndex].sets[setIndex];
    setExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex] = {
        ...updated[exerciseIndex],
        sets: updated[exerciseIndex].sets.map((_, i) => 
          i === setIndex ? sourceSet : { ...sourceSet }
        )
      };
      return updated;
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}
      
        <div className="space-y-2">
          <Label htmlFor="name">Routine Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              <h3 className="text-lg font-medium">Exercises</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addExercise}
              disabled={loadingExercises}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
          </div>

          {loadingExercises ? (
            <div className="text-center p-4">
              <div className="h-6 w-24 bg-muted rounded-md animate-pulse mx-auto mb-2" />
              <div className="h-4 w-32 bg-muted rounded-md animate-pulse mx-auto" />
            </div>
          ) : (
            <div className="space-y-6">
              {exercises.length === 0 ? (
                <div className="text-center p-6 border rounded-md bg-muted/10">
                  <p className="text-muted-foreground">No exercises added yet. Use the button above to add exercises to your routine.</p>
                </div>
              ) : (
                exercises.map((exercise, exerciseIndex) => (
                  <Card key={exerciseIndex} className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="w-full">
                          <Label htmlFor={`exercise-${exerciseIndex}`} className="mb-2 block">
                            Exercise {exerciseIndex + 1}
                          </Label>
                          <Select
                            value={exercise.exercise_id}
                            onValueChange={(value) => updateExercise(exerciseIndex, 'exercise_id', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select an exercise" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableExercises.map((ex) => (
                                <SelectItem key={ex.id} value={ex.id}>
                                  {ex.name} ({ex.muscle_group})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExercise(exerciseIndex)}
                          className="text-destructive ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Sets ({exercise.sets.length})</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSet(exerciseIndex)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Set
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {exercise.sets.map((set, setIndex) => (
                            <div key={setIndex} className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                              <span className="text-sm font-medium min-w-[2rem]">#{setIndex + 1}</span>
                              
                              <div className="flex-1 grid grid-cols-3 gap-2">
                                <div>
                                  <Label htmlFor={`reps-${exerciseIndex}-${setIndex}`} className="text-xs">Reps</Label>
                                  <Input
                                    id={`reps-${exerciseIndex}-${setIndex}`}
                                    type="number"
                                    min="1"
                                    value={set.reps}
                                    onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 1)}
                                    className="h-8"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`weight-${exerciseIndex}-${setIndex}`} className="text-xs">Weight (kg)</Label>
                                  <Input
                                    id={`weight-${exerciseIndex}-${setIndex}`}
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={set.weight || ''}
                                    onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', e.target.value ? parseFloat(e.target.value) : null)}
                                    placeholder="0"
                                    className="h-8"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`duration-${exerciseIndex}-${setIndex}`} className="text-xs">Duration (min)</Label>
                                  <Input
                                    id={`duration-${exerciseIndex}-${setIndex}`}
                                    type="number"
                                    min="0"
                                    value={set.duration_minutes || ''}
                                    onChange={(e) => updateSet(exerciseIndex, setIndex, 'duration_minutes', e.target.value ? parseInt(e.target.value) : null)}
                                    placeholder="0"
                                    className="h-8"
                                  />
                                </div>
                              </div>

                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copySetToAll(exerciseIndex, setIndex)}
                                  className="h-8 w-8"
                                  title="Copy to all sets"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeSet(exerciseIndex, setIndex)}
                                  className="h-8 w-8 text-destructive"
                                  disabled={exercise.sets.length === 1}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={loading || loadingExercises}
        >
          {loading ? 'Saving...' : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {initialData ? 'Update' : 'Create'} Routine
            </>
          )}
        </Button>
      </Card>
    </form>
  );
} 