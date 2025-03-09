'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Plus, Trash2, Save } from 'lucide-react';
import type { WorkoutWithExercises, Exercise } from '@/types/supabase-types';

interface WorkoutFormProps {
  initialData: WorkoutWithExercises;
  onSuccess: (workout: WorkoutWithExercises) => void;
}

export function WorkoutForm({ initialData, onSuccess }: WorkoutFormProps) {
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description || '');
  const [exercises, setExercises] = useState<{
    id?: string;
    exercise_id: string;
    sets: number;
    reps: number;
    weight: number | null;
    exercise?: Exercise | null;
  }[]>(initialData.workout_exercises?.map(ex => ({
    id: ex.id,
    exercise_id: ex.exercise_id || '',
    sets: ex.sets,
    reps: ex.reps,
    weight: ex.weight,
    exercise: ex.exercise
  })) || []);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingExercises, setLoadingExercises] = useState(true);

  // Fetch available exercises
  useEffect(() => {
    async function fetchExercises() {
      try {
        const response = await fetch('/api/exercises');
        if (!response.ok) {
          throw new Error('Failed to fetch exercises');
        }
        const data = await response.json();
        setAvailableExercises(data.exercises);
      } catch (err) {
        console.error('Error fetching exercises:', err);
      } finally {
        setLoadingExercises(false);
      }
    }

    fetchExercises();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/workouts/${initialData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: description || null,
          exercises: exercises.map(ex => ({
            id: ex.id, // Include ID for existing exercises
            exercise_id: ex.exercise_id,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update workout');
      }

      const { workout } = await response.json();
      onSuccess(workout);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const addExercise = () => {
    // Add a new empty exercise
    setExercises(prev => [
      ...prev, 
      { 
        exercise_id: '',
        sets: 3,
        reps: 10,
        weight: null
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

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Workout Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Exercises</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={addExercise}
              disabled={loadingExercises}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Exercise
            </Button>
          </div>

          {loadingExercises ? (
            <div className="text-center p-4">
              <div className="h-6 w-24 bg-muted rounded-md animate-pulse mx-auto mb-2" />
              <div className="h-4 w-32 bg-muted rounded-md animate-pulse mx-auto" />
            </div>
          ) : (
            <div className="space-y-4">
              {exercises.length === 0 ? (
                <div className="text-center p-4 border rounded-md bg-muted/10">
                  <p className="text-muted-foreground">No exercises added. Add your first exercise!</p>
                </div>
              ) : (
                exercises.map((exercise, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="w-full">
                          <Label htmlFor={`exercise-${index}`}>Exercise</Label>
                          <Select
                            value={exercise.exercise_id}
                            onValueChange={(value) => updateExercise(index, 'exercise_id', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select an exercise" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableExercises.map((ex) => (
                                <SelectItem key={ex.id} value={ex.id}>
                                  {ex.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExercise(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`sets-${index}`}>Sets</Label>
                          <Input
                            id={`sets-${index}`}
                            type="number"
                            min="1"
                            value={exercise.sets}
                            onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`reps-${index}`}>Reps</Label>
                          <Input
                            id={`reps-${index}`}
                            type="number"
                            min="1"
                            value={exercise.reps}
                            onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`weight-${index}`}>Weight (kg)</Label>
                          <Input
                            id={`weight-${index}`}
                            type="number"
                            min="0"
                            step="0.5"
                            value={exercise.weight || ''}
                            onChange={(e) => updateExercise(index, 'weight', e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={loading || loadingExercises}
          >
            {loading ? 'Saving...' : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Workout
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
} 