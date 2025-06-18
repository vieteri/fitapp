"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TableRenderer } from "@/components/ai/table-renderer";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { authFetch } from "@/app/client-actions";
import { useRouter } from "next/navigation";

function RoutineCardSkeleton() {
  return (
    <Card className="p-6 h-full">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-1/4" />
    </Card>
  );
}

function RoutinesListContent() {
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchRoutines() {
      try {
        const response = await authFetch('/api/routines');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch routines');
        }

        setRoutines(data.routines || []);
      } catch (error) {
        console.error('Error fetching routines:', error);
        if (error instanceof Error && error.message === 'Authentication token expired') {
          router.push('/sign-in');
        } else {
          toast.error('Failed to load routines');
        }
        setRoutines([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRoutines();
  }, [router]);

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
              <div className="text-sm text-muted-foreground mb-2 prose prose-sm max-w-none dark:prose-invert">
                <TableRenderer content={routine.description} />
              </div>
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

export function RoutinesList() {
  return (
    <ErrorBoundary>
      <RoutinesListContent />
    </ErrorBoundary>
  );
} 