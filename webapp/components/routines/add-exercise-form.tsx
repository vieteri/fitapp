"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import type { Exercise } from "@/types/supabase-types";

interface AddExerciseFormProps {
  routineId: string;
  exercises: Exercise[];
  onExerciseAdded: () => void;
}

export function AddExerciseForm({ routineId, exercises, onExerciseAdded }: AddExerciseFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    exercise_id: '',
    sets: 3,
    reps: 10,
    weight: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.exercise_id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/routines/${routineId}/exercises/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          order_index: 999 // Will be at the end
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add exercise');
      }

      setFormData({
        exercise_id: '',
        sets: 3,
        reps: 10,
        weight: 0,
      });
      onExerciseAdded();
    } catch (error) {
      console.error('Error adding exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="exercise">Exercise</Label>
          <Select
            value={formData.exercise_id}
            onValueChange={(value) => setFormData({ ...formData, exercise_id: value })}
          >
            <SelectTrigger id="exercise">
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
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sets">Sets</Label>
            <Input
              id="sets"
              type="number"
              min="1"
              value={formData.sets}
              onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value, 10) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reps">Reps</Label>
            <Input
              id="reps"
              type="number"
              min="1"
              value={formData.reps}
              onChange={(e) => setFormData({ ...formData, reps: parseInt(e.target.value, 10) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              min="0"
              step="0.5"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          <Plus className="w-4 h-4 mr-2" />
          Add Exercise
        </Button>
      </Card>
    </form>
  );
} 