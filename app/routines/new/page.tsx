"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Exercise } from '@/types/supabase-types';

interface ExerciseSet {
  reps: number;
  weight?: number;
  duration_minutes?: number;
}

interface ExerciseWithSets {
  exercise: Exercise;
  sets: ExerciseSet[];
}

export default function NewRoutinePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<ExerciseWithSets[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Fetch available exercises
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch('/api/exercises');
        if (!response.ok) throw new Error('Failed to fetch exercises');
        const data = await response.json();
        setExercises(data.exercises);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };

    fetchExercises();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedExercises.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          exercises: selectedExercises.flatMap((ex, exerciseIndex) => 
            ex.sets.map((set, setIndex) => ({
              exercise_id: ex.exercise.id,
              sets: 1, // Each set is its own record
              reps: set.reps,
              weight: set.weight,
              duration_minutes: set.duration_minutes,
              order_index: exerciseIndex
            }))
          )
        })
      });

      if (!response.ok) throw new Error('Failed to create routine');
      router.push('/routines');
    } catch (error) {
      console.error('Error creating routine:', error);
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
        <h1 className="text-2xl font-bold">Create New Routine</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Routine Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Push Pull Legs"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your routine..."
                className="h-24"
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

          {selectedExercises.map((ex, exerciseIndex) => (
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
                          <Input
                            type="number"
                            value={set.reps}
                            onChange={(e) => updateSetDetails(exerciseIndex, setIndex, 'reps', e.target.value)}
                            min={1}
                            placeholder="Reps"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            value={set.weight || ''}
                            onChange={(e) => updateSetDetails(exerciseIndex, setIndex, 'weight', e.target.value)}
                            min={0}
                            step={0.5}
                            placeholder="Weight (kg)"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
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
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !name || selectedExercises.length === 0}
          >
            {loading ? 'Creating...' : 'Create Routine'}
          </Button>
        </div>
      </form>
    </div>
  );
} 