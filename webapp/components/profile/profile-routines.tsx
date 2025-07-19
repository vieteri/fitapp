"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TableRenderer } from "@/components/ai/table-renderer";
import { authFetch } from "@/app/client-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import type { RoutineWithExercises } from "@/types/supabase-types";

export function ProfileRoutines() {
  const [routines, setRoutines] = useState<RoutineWithExercises[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const response = await authFetch('/api/routines?limit=5');
        if (!response.ok) {
          throw new Error('Failed to fetch routines');
        }
        const data = await response.json();
        setRoutines(data.routines || []);
      } catch (error) {
        console.error('Error fetching routines:', error);
        if (error instanceof Error && error.message === 'Authentication token expired') {
          router.push('/sign-in');
        } else {
          toast.error('Failed to load routines');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, [router]);

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Routines</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent Routines</h2>
        <Link 
          href="/routines" 
          className="text-sm text-muted-foreground hover:text-primary"
        >
          View all
        </Link>
      </div>
      
      {routines.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No routines created yet
        </p>
      ) : (
        <div className="space-y-4">
          {routines.map((routine) => (
            <Link 
              key={routine.id}
              href={`/routines/${routine.id}`}
              className="block p-4 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{routine.name}</h3>
                  {routine.description && (
                    <div className="text-sm text-muted-foreground mt-1 prose prose-sm max-w-none dark:prose-invert">
                      <TableRenderer content={routine.description} />
                    </div>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {routine.routine_exercises?.length || 0} exercises
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
} 