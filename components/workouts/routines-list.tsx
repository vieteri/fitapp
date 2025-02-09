"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

function RoutineCardSkeleton() {
  return (
    <Card className="p-6 h-full">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-1/4" />
    </Card>
  );
}

export function RoutinesList() {
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoutines() {
      try {
        const response = await fetch('/api/routines');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch routines');
        }

        setRoutines(data.routines || []);
      } catch (error) {
        console.error('Error fetching routines:', error);
        toast.error('Failed to load routines');
        setRoutines([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRoutines();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <RoutineCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (routines.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">No routines found</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {routines.map((routine) => (
        <Link 
          key={routine.id} 
          href={`/routines/${routine.id}`}
          className="block"
        >
          <Card className="p-6 h-full hover:bg-muted/50 transition-colors">
            <h3 className="font-medium mb-2">{routine.name}</h3>
            {routine.description && (
              <p className="text-sm text-muted-foreground mb-2">
                {routine.description}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {routine.routine_exercises?.length ?? 0} exercises
            </p>
          </Card>
        </Link>
      ))}
    </div>
  );
} 