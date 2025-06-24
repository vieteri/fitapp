import type { Tables } from '@/types/supabase-types';
import { Clock, StickyNote } from 'lucide-react';
import { isCardioExercise, getSetLabel, isDistanceBasedCardio } from '@/utils/utils';

type Exercise = Tables<'exercises'>;
type RoutineExercise = Tables<'routine_exercises'>;
type ExerciseSet = Tables<'exercise_sets'>;

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
                    <span>{getSetLabel({...exercise.exercise, name: exercise.exercise?.name}, exercise.exercise_sets?.length || exercise.sets)}</span>
                  </div>
                </div>
                
                {/* Display individual sets */}
                {exercise.exercise_sets && exercise.exercise_sets.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      {getSetLabel({...exercise.exercise, name: exercise.exercise?.name}, 2).charAt(0).toUpperCase() + getSetLabel({...exercise.exercise, name: exercise.exercise?.name}, 2).slice(1)}:
                    </div>
                    <div className="grid gap-2">
                      {exercise.exercise_sets
                        .sort((a, b) => a.set_number - b.set_number)
                        .map((set, index) => (
                          <div key={set.id} className="flex items-center gap-4 p-2 bg-muted/50 rounded-md text-sm">
                            <span className="font-medium min-w-[2rem]">#{set.set_number}</span>
                            <div className="flex items-center gap-4">
                              {isCardioExercise(exercise.exercise) ? (
                                isDistanceBasedCardio(exercise.exercise?.name || '') ? (
                                  // Distance-Based Cardio: Distance first, then duration
                                  <>
                                    {set.duration_minutes && (
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium">{set.duration_minutes}</span>
                                        <span className="text-muted-foreground">km</span>
                                      </div>
                                    )}
                                    {set.reps && (
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium">{set.reps}</span>
                                        <span className="text-muted-foreground">min</span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  // Time-Based Cardio: Duration first, then reps (optional)
                                  <>
                                    {set.duration_minutes && (
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium">{set.duration_minutes}</span>
                                        <span className="text-muted-foreground">min</span>
                                      </div>
                                    )}
                                    {set.reps && (
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium">{set.reps}</span>
                                        <span className="text-muted-foreground">reps</span>
                                      </div>
                                    )}
                                  </>
                                )
                              ) : (
                                // Strength: Reps first, then weight, then duration
                                <>
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
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  /* Fallback for routines without detailed sets */
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {isCardioExercise(exercise.exercise) ? (
                      isDistanceBasedCardio(exercise.exercise?.name || '') ? (
                        // Distance-Based Cardio: Distance first, then duration
                        <>
                          {exercise.duration_minutes && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{exercise.duration_minutes}</span>
                              <span>km</span>
                            </div>
                          )}
                          {exercise.reps && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{exercise.reps}</span>
                              <span>min</span>
                            </div>
                          )}
                        </>
                      ) : (
                        // Time-Based Cardio: Duration first, then reps
                        <>
                          {exercise.duration_minutes && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{exercise.duration_minutes}</span>
                              <span>min</span>
                            </div>
                          )}
                          {exercise.reps && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{exercise.reps}</span>
                              <span>reps</span>
                            </div>
                          )}
                        </>
                      )
                    ) : (
                      // Strength: Reps first, then weight, then duration
                      <>
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
                            <span>{isDistanceBasedCardio(exercise.exercise?.name || '') ? 'km' : 'min'}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                {/* Rest Time and Notes */}
                <div className="flex items-center gap-4 text-sm">
                  {exercise.rest_time_seconds && exercise.rest_time_seconds !== 60 && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">{exercise.rest_time_seconds}s rest</span>
                    </div>
                  )}
                  
                  {exercise.notes && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <StickyNote className="h-4 w-4" />
                      <span className="font-medium">Has notes</span>
                    </div>
                  )}
                </div>
                
                {/* Exercise Notes */}
                {exercise.notes && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                    <div className="flex items-center gap-2 mb-1">
                      <StickyNote className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Notes:</span>
                    </div>
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      {exercise.notes}
                    </div>
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