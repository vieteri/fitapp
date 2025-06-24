"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DumbbellIcon, Plus, Clock, StickyNote } from "lucide-react";
import { TableRenderer } from "@/components/ai/table-renderer";
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
          {routines.map((routine) => {
            const exercisesWithNotes = routine.routine_exercises?.filter(ex => ex.notes?.trim()) || [];
            const exercisesWithRestTimes = routine.routine_exercises?.filter(ex => ex.rest_time_seconds && ex.rest_time_seconds !== 60) || [];
            const avgRestTime = routine.routine_exercises?.length ? 
              Math.round((routine.routine_exercises.reduce((sum, ex) => sum + (ex.rest_time_seconds || 60), 0)) / routine.routine_exercises.length) : 60;
            
            return (
              <Link key={routine.id} href={`/routines/${routine.id}`}>
                <Card className="p-4 hover:bg-muted/50 transition-colors">
                  <h3 className="text-xl font-semibold">{routine.name}</h3>
                  {routine.description && (
                    <div className="mt-1 text-sm text-muted-foreground prose prose-sm max-w-none dark:prose-invert">
                      <TableRenderer content={routine.description} />
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <DumbbellIcon className="h-4 w-4" />
                      <span>{routine.routine_exercises?.length || 0} exercises</span>
                    </div>
                    
                    {avgRestTime !== 60 && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>~{avgRestTime}s rest</span>
                      </div>
                    )}
                    
                    {exercisesWithNotes.length > 0 && (
                      <div className="flex items-center gap-1">
                        <StickyNote className="h-4 w-4" />
                        <span>{exercisesWithNotes.length} noted</span>
                      </div>
                    )}
                  </div>
                  
                  {exercisesWithRestTimes.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Custom rest times: {exercisesWithRestTimes.map(ex => `${ex.exercise?.name}: ${ex.rest_time_seconds}s`).join(', ')}
                    </div>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
} 