"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DumbbellIcon, Plus } from "lucide-react";
import type { RoutineWithExercises } from "@/types/supabase-types";

interface RoutineListProps {
  routines: RoutineWithExercises[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function RoutineList({ routines, isLoading, onDelete }: RoutineListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/4 mt-2" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Routines</h2>
        <Link href="/routines/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Routine
          </Button>
        </Link>
      </div>

      {routines.length === 0 ? (
        <Card className="p-6 text-center">
          <DumbbellIcon className="w-12 h-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No routines yet</h3>
          <p className="mt-2 text-muted-foreground">
            Create your first workout routine to get started
          </p>
          <Link href="/routines/new" className="mt-4 inline-block">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Routine
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {routines.map((routine) => (
            <Link key={routine.id} href={`/routines/${routine.id}`}>
              <Card className="p-4 hover:bg-muted/50 transition-colors">
                <h3 className="text-xl font-semibold">{routine.name}</h3>
                {routine.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {routine.description}
                  </p>
                )}
                <div className="mt-2 text-sm text-muted-foreground">
                  {routine.routine_exercises?.length || 0} exercises
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 