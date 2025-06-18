"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { RoutineForm } from "@/components/routines/routine-form";
import type { Routine } from "@/types/supabase-types";

export default function NewRoutinePage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSuccess = (routine: Routine) => {
    router.push(`/routines/${routine.id}`);
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Please sign in to create routines</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create New Routine</h1>
          <p className="text-muted-foreground mt-2">
            Build your workout routine with exercises and customize weight for each set
          </p>
        </div>
        
        <RoutineForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
} 