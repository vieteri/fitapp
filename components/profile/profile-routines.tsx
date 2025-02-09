"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { RoutineList } from "@/components/routines/routine-list";
import type { RoutineWithExercises } from "@/types/supabase-types";

export function ProfileRoutines() {
  const [routines, setRoutines] = useState<RoutineWithExercises[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (id: string) => {
    // Implement delete logic
  };

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const response = await fetch("/api/routines");
        if (!response.ok) throw new Error("Failed to fetch routines");
        const data = await response.json();
        setRoutines(data.routines);
      } finally {
        setLoading(false);
      }
    };

    void fetchRoutines();
  }, []);

  return (
    <Card className="p-6">
      <RoutineList 
        routines={routines} 
        isLoading={loading}
        onDelete={handleDelete}
      />
    </Card>
  );
} 