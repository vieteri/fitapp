"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Workout } from '@/types/supabase-types';

const ITEMS_PER_PAGE = 10;

export default function WorkoutHistoryPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await fetch(`/api/workouts/history?page=${page}&limit=${ITEMS_PER_PAGE}`);
        if (!response.ok) throw new Error('Failed to fetch workouts');
        const data = await response.json();
        setWorkouts(data.workouts);
        setTotalCount(data.total);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [page]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workout History</h1>
        <Button onClick={() => router.push('/workouts')}>
          Start New Workout
        </Button>
      </div>

      <div className="space-y-4">
        {workouts.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground text-center">No workouts found</p>
          </Card>
        ) : (
          <>
            {workouts.map((workout) => (
              <Card 
                key={workout.id} 
                className="p-6 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/workouts/${workout.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">
                      {workout.routine?.name || "Custom Workout"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(workout.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant={workout.status === 'completed' ? 'default' : 'secondary'}>
                    {workout.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {workout.workout_exercises?.length ?? 0} exercises
                </p>
              </Card>
            ))}

            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 