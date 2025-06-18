"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusIcon, DumbbellIcon, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { ExerciseSkeleton } from "@/components/exercises/exercise-skeleton";
import type { Tables } from '@/types/supabase-types';
import { useAuth } from "@/context/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Exercise = Tables<'exercises'> & {
  created_at: string;
  updated_at: string;
};

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const itemsPerPage = 10;
  const { user } = useAuth();
  const supabase = createClient();


  const fetchExercises = useCallback(async (pageNumber: number) => {
    try {
      const start = pageNumber * itemsPerPage;
      const end = start + itemsPerPage - 1;

      const { data, error, count } = await supabase
        .from('exercises')
        .select('*', { count: 'exact' })
        .range(start, end)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setExercises(prev => pageNumber === 0 ? data : [...prev, ...data]);
      setHasMore(count ? start + data.length < count : false);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/exercises/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete exercise');
      }

      setExercises(exercises.filter(ex => ex.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  useEffect(() => {
    fetchExercises(page);
  }, [page, fetchExercises]);

  const deleteDialog = (
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
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <Link href="/exercises/new">
          <Button className="gap-2">
            <PlusIcon size={16} />
            Add Exercise
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {loading && page === 0 ? (
          <>
            <ExerciseSkeleton />
            <ExerciseSkeleton />
            <ExerciseSkeleton />
          </>
        ) : (
          <>
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <DumbbellIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold">{exercise.name}</h2>
                        <p className="text-sm text-muted-foreground">
                          {exercise.muscle_group}
                        </p>
                      </div>
                      {user && (
                        <div className="flex gap-2">
                          <Link href={`/exercises/${exercise.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(exercise.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {exercise.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {exercise.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setPage(page + 1)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            )}
          </>
        )}
      </div>

      {deleteDialog}
    </div>
  );
} 