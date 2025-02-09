"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RoutineForm } from "@/components/routines/routine-form";
import { RoutineSkeleton } from "@/components/routines/routine-skeleton";
import type { Routine } from '@/types/supabase-types';
import { use } from 'react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditRoutinePage({ params }: Props) {
  const resolvedParams = await params;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
      return;
    }

    const fetchRoutine = async () => {
      try {
        const response = await fetch(`/api/routines/${resolvedParams.id}`);
        if (!response.ok) throw new Error('Failed to fetch routine');
        const data = await response.json();
        setRoutine(data.routine);
      } catch (error) {
        console.error('Error fetching routine:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRoutine();
    }
  }, [user, authLoading, router, resolvedParams.id]);

  if (loading || authLoading) {
    return <RoutineSkeleton />;
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