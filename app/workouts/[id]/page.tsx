'use client';

import { useEffect, useState, use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Dumbbell, Timer, Calendar, TrendingUp } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { WorkoutWithExercises, WorkoutExercise, ExerciseSet } from '@/types/supabase-types';

interface WorkoutPageProps {
  params: Promise<{ id: string }>;
}

// Group workout exercises by exercise type and collect their sets
function groupExercisesByType(workoutExercises: (WorkoutExercise & { exercise: any })[]) {
  const grouped = new Map<string, {
    exercise: any;
    sets: (WorkoutExercise & { exercise: any; setNumber: number })[];
    totalWeight: number;
    totalReps: number;
  }>();

  workoutExercises.forEach((we, index) => {
    const exerciseId = we.exercise_id || 'unknown';
    const exerciseName = we.exercise?.name || 'Unknown Exercise';
    
    if (!grouped.has(exerciseId)) {
      grouped.set(exerciseId, {
        exercise: we.exercise,
        sets: [],
        totalWeight: 0,
        totalReps: 0
      });
    }
    
    const group = grouped.get(exerciseId)!;
    group.sets.push({ ...we, setNumber: group.sets.length + 1 });
    group.totalWeight += (we.weight || 0) * we.reps;
    group.totalReps += we.reps;
  });

  return Array.from(grouped.values());
}

export default function WorkoutPage({ params }: WorkoutPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkout() {
      try {
        const response = await fetch(`/api/workouts/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error('Failed to fetch workout');
        }
        const data = await response.json();
        setWorkout(data.workout);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchWorkout();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this workout?')) return;
    
    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete workout');
      
      router.push('/workouts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workout');
    }
  };

  const handleEdit = () => {
    router.push(`/workouts/${id}/edit`);
  };

  if (loading) return <WorkoutSkeleton />;
  if (error) return <div className="text-destructive">{error}</div>;
  if (!workout) return notFound();

  const groupedExercises = groupExercisesByType(workout.workout_exercises || []);
  const totalExercises = groupedExercises.length;
  const totalSets = groupedExercises.reduce((sum, group) => sum + group.sets.length, 0);
  const totalVolume = groupedExercises.reduce((sum, group) => sum + group.totalWeight, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-3/4 -right-4 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/90"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDelete}
              className="bg-red-500/90 hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Workout Header Card */}
        <Card className="mb-8 p-6 bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {workout.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(workout.created_at), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  Started {formatDistanceToNow(new Date(workout.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              <Dumbbell className="h-3 w-3 mr-1" />
              Workout
            </Badge>
          </div>

          {/* Workout Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalExercises}</div>
              <div className="text-sm text-muted-foreground">Exercises</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalSets}</div>
              <div className="text-sm text-muted-foreground">Total Sets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalVolume.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Volume (kg×reps)</div>
            </div>
          </div>
        </Card>

        {/* Exercises */}
        <div className="space-y-6">
          {groupedExercises.map((group, groupIndex) => (
            <Card key={group.exercise?.id || groupIndex} className="p-6 bg-white/70 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="space-y-4">
                {/* Exercise Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Dumbbell className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {group.exercise?.name || 'Unknown Exercise'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {group.exercise?.muscle_group || 'Unknown'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {group.sets.length} sets
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      {group.totalWeight.toFixed(0)} kg×reps
                    </div>
                    <div className="text-sm text-muted-foreground">Total Volume</div>
                  </div>
                </div>

                {/* Sets Grid */}
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                    <div>Set</div>
                    <div>Reps</div>
                    <div>Weight (kg)</div>
                    <div>Volume</div>
                  </div>
                  
                  {group.sets.map((set, setIndex) => (
                    <div 
                      key={set.id} 
                      className="grid grid-cols-4 gap-4 items-center p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {set.setNumber}
                        </div>
                      </div>
                      
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {set.reps}
                      </div>
                      
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {set.weight ? `${set.weight}` : '-'}
                      </div>
                      
                      <div className="text-lg font-semibold text-green-600">
                        {set.weight ? `${(set.weight * set.reps).toFixed(0)}` : '-'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Exercise Summary */}
                <div className="flex items-center justify-between pt-3 border-t bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg p-3">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{group.totalReps} total reps</span>
                    </div>
                    {group.exercise?.description && (
                      <span className="text-muted-foreground">
                        {group.exercise.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {groupedExercises.length === 0 && (
          <Card className="p-8 text-center bg-white/70 backdrop-blur-sm border-white/20">
            <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No exercises recorded</h3>
            <p className="text-muted-foreground">This workout doesn&apos;t have any exercises yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function WorkoutSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-10 w-24 bg-muted rounded-md animate-pulse" />
          <div className="flex-1">
            <div className="h-8 w-64 bg-muted rounded-md mb-2 animate-pulse" />
            <div className="h-5 w-48 bg-muted rounded-md animate-pulse" />
          </div>
        </div>

        <Card className="mb-8 p-6 bg-white/70 backdrop-blur-sm border-white/20">
          <div className="h-8 w-48 bg-muted rounded-md mb-4 animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-muted rounded-lg animate-pulse" />
            <div className="h-16 bg-muted rounded-lg animate-pulse" />
            <div className="h-16 bg-muted rounded-lg animate-pulse" />
          </div>
        </Card>

        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 bg-white/70 backdrop-blur-sm border-white/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
                  <div>
                    <div className="h-6 w-48 bg-muted rounded-md mb-2 animate-pulse" />
                    <div className="h-4 w-32 bg-muted rounded-md animate-pulse" />
                  </div>
                </div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="grid grid-cols-4 gap-4">
                      <div className="h-10 bg-muted rounded-md animate-pulse" />
                      <div className="h-10 bg-muted rounded-md animate-pulse" />
                      <div className="h-10 bg-muted rounded-md animate-pulse" />
                      <div className="h-10 bg-muted rounded-md animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 