"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Exercise, Routine } from '@/types/supabase-types';

interface RoutineFormProps {
  initialData?: Routine;
  onSuccess: (routine: Routine) => void;
}

type RoutineExercise = {
  exercise_id: string;
  sets: number;
  reps: number;
  weight: number | null;
  duration_minutes: number | null;
};

export function RoutineForm({ initialData, onSuccess }: RoutineFormProps) {
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    routine_exercises: (initialData?.routine_exercises || []).map(re => ({
      exercise_id: re.exercise_id,
      sets: re.sets,
      reps: re.reps,
      weight: re.weight,
      duration_minutes: re.duration_minutes
    })) as RoutineExercise[]
  });

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
    if (!formData.name || formData.routine_exercises.length === 0) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch(
        initialData ? `/api/routines/${initialData.id}/` : '/api/routines',
        {
          method: initialData ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save routine');
      }
      
      onSuccess(data.routine);
    } catch (error) {
      console.error('Error saving routine:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Exercises</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData({
                ...formData,
                routine_exercises: [...formData.routine_exercises, {
                  exercise_id: '',
                  sets: 3,
                  reps: 10,
                  weight: null,
                  duration_minutes: null
                }]
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
          </div>

          <div className="space-y-4">
            {formData.routine_exercises.map((re, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Exercise {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({
                        ...formData,
                        routine_exercises: formData.routine_exercises.filter((_, i) => i !== index)
                      })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <Select
                    value={re.exercise_id}
                    onValueChange={(value) => {
                      const newExercises = [...formData.routine_exercises];
                      newExercises[index] = { ...newExercises[index], exercise_id: value };
                      setFormData({ ...formData, routine_exercises: newExercises });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {exercises.map((exercise) => (
                        <SelectItem key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sets</Label>
                      <Input
                        type="number"
                        min="1"
                        value={re.sets}
                        onChange={(e) => {
                          const newExercises = [...formData.routine_exercises];
                          newExercises[index] = { ...newExercises[index], sets: parseInt(e.target.value) };
                          setFormData({ ...formData, routine_exercises: newExercises });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reps</Label>
                      <Input
                        type="number"
                        min="1"
                        value={re.reps}
                        onChange={(e) => {
                          const newExercises = [...formData.routine_exercises];
                          newExercises[index] = { ...newExercises[index], reps: parseInt(e.target.value) };
                          setFormData({ ...formData, routine_exercises: newExercises });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving...' : (initialData ? 'Update' : 'Create')} Routine
        </Button>
      </Card>
    </form>
  );
} 