'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExerciseForm } from "@/components/exercises/exercise-form";
import type { Tables } from '@/types/supabase-types';

type Exercise = Tables<'exercises'>;

export function ExerciseList({ initialExercises }: { initialExercises: Exercise[] }) {
  const router = useRouter();
  const [exercises, setExercises] = useState(initialExercises);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editExercise, setEditExercise] = useState<Exercise | null>(null);

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/exercises/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      setExercises(exercises.filter(e => e.id !== id));
      setDeleteId(null);
    }
  };

  const handleEdit = async (formData: Partial<Exercise>) => {
    if (!editExercise) return;
    
    try {
      const response = await fetch(`/api/exercises/${editExercise.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update exercise');

      setExercises(prev => prev.map(ex => 
        ex.id === editExercise.id ? { ...ex, ...formData } : ex
      ));
      setEditExercise(null);
      router.refresh();
    } catch (error) {
      console.error('Error updating exercise:', error);
      alert('Failed to update exercise');
    }
  };

  return (
    <div className="grid gap-4">
      {exercises.map((exercise) => (
        <Card key={exercise.id} className="p-4">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{exercise.name}</h2>
                  {exercise.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {exercise.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditExercise(exercise)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(exercise.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm bg-primary/10 text-primary rounded-full px-2 py-1">
                  {exercise.muscle_group}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exercise</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this exercise? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editExercise !== null} onOpenChange={() => setEditExercise(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
          </DialogHeader>
          {editExercise && (
            <ExerciseForm
              initialValues={editExercise}
              onSubmit={handleEdit}
              onCancel={() => setEditExercise(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 