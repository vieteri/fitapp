"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DumbbellIcon } from 'lucide-react';
import Link from 'next/link';
import type { Tables } from '@/types/supabase-types';

type Workout = Tables<'workouts'> & {
  workout_exercises: (Tables<'workout_exercises'> & {
    exercise: Tables<'exercises'>
  })[];
};

interface ProfileWorkoutsProps {
  onLoadingChange?: (loading: boolean) => void;
}

export function ProfileWorkouts({ onLoadingChange }: ProfileWorkoutsProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await fetch('/api/workouts');
        if (!response.ok) throw new Error('Failed to fetch workouts');
        const data = await response.json();
        setWorkouts(data.workouts?.slice(0, 3) || []);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  if (loading) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent Workouts</h2>
        <Link href="/workouts">
          <Button variant="ghost" size="sm">View All</Button>
        </Link>
      </div>
      <div className="space-y-4">
        {workouts.map((workout) => (
          <div key={workout.id} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <DumbbellIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">{workout.name}</p>
              <p className="text-sm text-muted-foreground">
                {workout.workout_exercises.length} exercises
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 