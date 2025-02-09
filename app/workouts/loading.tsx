import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function WorkoutsLoading() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="space-y-6">
        {/* Quick Start Section */}
        <LoadingSkeleton variant="card" count={1} />

        {/* Routines Section */}
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid gap-4 sm:grid-cols-2">
            <LoadingSkeleton variant="card" count={4} />
          </div>
        </div>
      </div>
    </div>
  );
} 