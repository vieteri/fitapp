import type { Exercise, RoutineExercise, ExerciseSet } from '@/types/supabase-types';

interface ExerciseListProps {
  exercises: (RoutineExercise & {
    exercise?: Exercise;
    exercise_sets?: ExerciseSet[];
  })[];
}

export function ExerciseList({ exercises }: ExerciseListProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Exercises</h2>
        <div className="divide-y">
          {exercises?.map((exercise) => (
            <div key={exercise.id} className="py-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{exercise.exercise?.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">{exercise.exercise_sets?.length || exercise.sets}</span>
                    <span>sets</span>
                  </div>
                </div>
                
                {/* Display individual sets */}
                {exercise.exercise_sets && exercise.exercise_sets.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Sets:</div>
                    <div className="grid gap-2">
                      {exercise.exercise_sets
                        .sort((a, b) => a.set_number - b.set_number)
                        .map((set, index) => (
                          <div key={set.id} className="flex items-center gap-4 p-2 bg-muted/50 rounded-md text-sm">
                            <span className="font-medium min-w-[2rem]">#{set.set_number}</span>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{set.reps}</span>
                                <span className="text-muted-foreground">reps</span>
                              </div>
                              {set.weight && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">{set.weight}</span>
                                  <span className="text-muted-foreground">kg</span>
                                </div>
                              )}
                              {set.duration_minutes && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">{set.duration_minutes}</span>
                                  <span className="text-muted-foreground">min</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  /* Fallback for routines without detailed sets */
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{exercise.reps}</span>
                      <span>reps</span>
                    </div>
                    {exercise.weight && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{exercise.weight}</span>
                        <span>kg</span>
                      </div>
                    )}
                    {exercise.duration_minutes && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{exercise.duration_minutes}</span>
                        <span>min</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Exercise details */}
                {exercise.exercise && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div><span className="font-medium">Muscle Group:</span> {exercise.exercise.muscle_group}</div>
                    {exercise.exercise.description && (
                      <div><span className="font-medium">Description:</span> {exercise.exercise.description}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 