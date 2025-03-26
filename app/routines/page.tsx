"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RoutineList } from "@/components/routines/routine-list";
import { useAuth } from "@/context/auth-context";
import { authFetch } from "@/app/client-actions";
import { toast } from "sonner";
import type { Routine, RoutineWithExercises } from '@/types/supabase-types';

export default function RoutinesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [routines, setRoutines] = useState<RoutineWithExercises[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
      return;
    }

    const fetchRoutines = async () => {
      try {
        const response = await authFetch('/api/routines');
        if (!response.ok) {
          throw new Error('Failed to fetch routines');
        }
        const data = await response.json();
        setRoutines(data.routines.map((r: Routine) => ({
          ...r,
          routine_exercises: r.routine_exercises || []
        })));
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

    if (user) {
      fetchRoutines();
    }
  }, [user, authLoading, router]);

  const handleDelete = async (id: string) => {
    try {
      const response = await authFetch(`/api/routines/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete routine');
      }
      setRoutines(routines.filter(r => r.id !== id));
      toast.success('Routine deleted successfully');
    } catch (error) {
      console.error('Error deleting routine:', error);
      if (error instanceof Error && error.message === 'Authentication token expired') {
        router.push('/sign-in');
      } else {
        toast.error('Failed to delete routine');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Routines</h1>
        <Button onClick={() => router.push('/routines/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Routine
        </Button>
      </div>

      <RoutineList 
        routines={routines} 
        isLoading={loading || authLoading}
        onDelete={handleDelete}
      />
    </div>
  );
} 