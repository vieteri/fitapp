import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function WorkoutLoading() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-24" /> {/* Back button */}
        <div className="flex-1">
          <Skeleton className="h-8 w-64 mb-2" /> {/* Title */}
          <Skeleton className="h-5 w-48" /> {/* Date and time */}
        </div>
        <Skeleton className="h-10 w-32" /> {/* Action button */}
      </div>

      <div className="space-y-6">
        {/* Timer Card */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-16 w-48 mx-auto" />
        </Card>

        {/* Exercises */}
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-48" /> {/* Exercise name */}
                  <Skeleton className="h-8 w-24" /> {/* Action button */}
                </div>
                
                {/* Sets */}
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="grid grid-cols-4 gap-4">
                      <Skeleton className="h-10" /> {/* Set number */}
                      <Skeleton className="h-10" /> {/* Reps */}
                      <Skeleton className="h-10" /> {/* Weight */}
                      <Skeleton className="h-10" /> {/* Complete button */}
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