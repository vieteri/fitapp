"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Exercise, Routine, RoutineWithExercises } from '@/types/supabase-types';

interface ExerciseSet {
  reps: number;
  weight?: number;
  duration_minutes?: number;
}

interface ExerciseWithSets {
  exercise: Exercise;
  sets: ExerciseSet[];
}

interface EditRoutineFormProps {
  initialData: {
    routine: RoutineWithExercises;
    exercises: Exercise[];
  };
  routineId: string;
}

export default function EditRoutineForm({ initialData, routineId }: EditRoutineFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initialData.routine.name);
  const [description, setDescription] = useState(initialData.routine.description || "");
  const [selectedExercises, setSelectedExercises] = useState<ExerciseWithSets[]>(
    Object.values(
      (initialData.routine.routine_exercises || []).reduce((groups: Record<number, ExerciseWithSets>, re) => {
        groups[re.order_index] = {
          exercise: re.exercise,
          sets: [{
            reps: re.reps,
            weight: re.weight || undefined,
            duration_minutes: re.duration_minutes || undefined
          }]
        };
        return groups;
      }, {})
    )
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedExercises.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/routines/${routineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          exercises: selectedExercises.flatMap((ex, exerciseIndex) => 
            ex.sets.map(set => ({
              exercise_id: ex.exercise.id,
              sets: 1,
              reps: set.reps,
              weight: set.weight,
              duration_minutes: set.duration_minutes,
              order_index: exerciseIndex
            }))
          )
        })
      });

      if (!response.ok) throw new Error('Failed to update routine');
      router.push(`/routines/${routineId}`);
    } catch (error) {
      console.error('Error updating routine:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add exercise handlers here
  // ...

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Routine</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Form implementation */}
        {/* ... */}
      </form>
    </div>
  );
} 