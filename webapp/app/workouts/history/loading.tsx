import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function WorkoutHistoryLoading() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-24" /> {/* Back button */}
        <Skeleton className="h-8 w-48" /> {/* Title */}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="space-y-4">
        <LoadingSkeleton 
          variant="list" 
          count={5} 
          className="p-4 border rounded-lg" 
        />
      </div>
    </div>
  );
} 