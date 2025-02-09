"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { DumbbellIcon, BarChart3Icon } from "lucide-react";

type ProfileStats = {
  totalWorkouts: number;
  totalExercises: number;
  completedWorkouts: number;
  activeRoutines: number;
};

export function ProfileStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [workoutsRes, routinesRes] = await Promise.all([
          fetch('/api/workouts'),
          fetch('/api/routines')
        ]);

        const [workoutsData, routinesData] = await Promise.all([
          workoutsRes.json(),
          routinesRes.json()
        ]);

        setStats({
          totalWorkouts: workoutsData.workouts.length,
          completedWorkouts: workoutsData.workouts.filter((w: any) => w.status === 'completed').length,
          totalExercises: workoutsData.workouts.reduce((acc: number, w: any) => 
            acc + (w.workout_exercises?.length || 0), 0),
          activeRoutines: routinesData.routines.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 mb-6">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 mb-6">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <DumbbellIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Workouts</h3>
            <p className="text-muted-foreground">
              {stats.completedWorkouts} completed of {stats.totalWorkouts} total
            </p>
            <p className="text-muted-foreground">
              {stats.totalExercises} exercises logged
            </p>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <BarChart3Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Routines</h3>
            <p className="text-muted-foreground">
              {stats.activeRoutines} active routines
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
} 