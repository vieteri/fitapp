interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  equipment: string;
  muscle_group: string;
}

interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight: number;
  duration_minutes: number;
  exercise: Exercise;
}

interface ExerciseListProps {
  exercises: RoutineExercise[];
}

export function ExerciseList({ exercises }: ExerciseListProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Exercises</h2>
        <div className="divide-y">
          {exercises?.map((exercise) => (
            <div key={exercise.id} className="py-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{exercise.exercise.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {exercise.sets && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{exercise.sets}</span>
                        <span>sets</span>
                      </div>
                    )}
                    {exercise.reps && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{exercise.reps}</span>
                        <span>reps</span>
                      </div>
                    )}
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
                </div>
                <div className="text-sm text-muted-foreground">
                  <div><span className="font-medium">Category:</span> {exercise.exercise.category}</div>
                  <div><span className="font-medium">Equipment:</span> {exercise.exercise.equipment}</div>
                  <div><span className="font-medium">Muscle Group:</span> {exercise.exercise.muscle_group}</div>
                  <div><span className="font-medium">Description:</span> {exercise.exercise.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 