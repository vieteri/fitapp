import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function NewWorkoutLoading() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-24" /> {/* Back button */}
        <Skeleton className="h-8 w-48" /> {/* Title */}
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-32" /> {/* Exercises label */}
          <Skeleton className="h-10 w-[200px]" /> {/* Exercise select */}
        </div>

        <Card className="p-6 text-center">
          <Skeleton className="h-5 w-64 mx-auto" /> {/* Empty state message */}
        </Card>

        {/* Exercise cards */}
        <LoadingSkeleton variant="form" count={2} />

        {/* Action buttons */}
        <div className="flex justify-end gap-4">
          <Skeleton className="h-10 w-24" /> {/* Cancel button */}
          <Skeleton className="h-10 w-32" /> {/* Start button */}
        </div>
      </div>
    </div>
  );
} 