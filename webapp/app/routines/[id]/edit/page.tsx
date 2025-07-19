"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RoutineForm } from "@/components/routines/routine-form";
import { RoutineSkeleton } from "@/components/routines/routine-skeleton";
import type { Routine } from '@/types/supabase-types';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditRoutinePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const response = await fetch(`/api/routines/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/routines');
            return;
          }
          throw new Error('Failed to fetch routine');
        }
        const data = await response.json();
        setRoutine(data.routine);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching routine:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutine();
  }, [id, router]);

  if (loading) {
    return <RoutineSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  if (!routine) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Routine</h1>
      </div>

      <RoutineForm 
        initialData={routine}
        onSuccess={(updatedRoutine) => {
          router.push(`/routines/${updatedRoutine.id}`);
        }}
      />
    </div>
  );
} 