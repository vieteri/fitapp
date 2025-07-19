import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RoutinesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </Card>
      ))}
    </div>
  );
} 