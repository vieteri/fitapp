'use client'

import { useState } from "react";
import { DumbbellIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tables } from '@/types/supabase-types';
import { deleteWorkout } from "@/app/server-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/utils/format";

type Workout = Tables<'workouts'> & {
  workout_exercises: (Tables<'workout_exercises'> & {
    exercise: Tables<'exercises'>
  })[];
};

export function WorkoutList({ initialWorkouts }: { initialWorkouts: Workout[] }) {
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const result = await deleteWorkout(id);
    if (!result.error) {
      setWorkouts(workouts.filter(w => w.id !== id));
      setDeleteId(null);
    }
  };

  const deleteDialog = (
    <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Workout</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this workout? This action cannot be undone.
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
  );

  return (
    <div className="grid gap-4">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <DumbbellIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{workout.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <time className="text-sm text-muted-foreground">
                      {formatDate(workout.created_at)}
                    </time>
                    {workout.description && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <p className="text-sm text-muted-foreground">
                          {workout.description}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(workout.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                {workout.workout_exercises.map((we) => (
                  <div key={we.id} className="text-sm">
                    <span className="font-medium">{we.exercise.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {we.sets} sets × {we.reps} reps
                      {we.weight && ` @ ${we.weight}kg`}
                      {we.duration_minutes && ` for ${we.duration_minutes} min`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {deleteDialog}
    </div>
  );
} 